"""Blender background export for a validated Shotfix scene plan. No external services.
blender --background --factory-startup --python render-guide.py -- settings.json output_dir
"""
import bpy, json, sys, math
from pathlib import Path
from mathutils import Vector
args=sys.argv[sys.argv.index('--')+1:]
settings=json.loads(Path(args[0]).read_text(encoding='utf-8-sig'))
plan=settings.get('plan',settings); camera=settings.get('camera',{})
assert plan['version']==1 and len(plan['subjects'])<=8
out=Path(args[1]).resolve();out.mkdir(parents=True,exist_ok=True)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
mat=bpy.data.materials.new('Guide grey');mat.diffuse_color=(.55,.55,.55,1)
def cube(name,position,scale):
    bpy.ops.mesh.primitive_cube_add(size=1,location=position);o=bpy.context.object;o.name=name;o.scale=scale;o.data.materials.append(mat);return o
def ball(name,position,radius):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1,radius=radius,location=position);o=bpy.context.object;o.name=name;o.data.materials.append(mat);return o
def limb(a,b,r):
    av,bv=Vector(a),Vector(b);v=bv-av
    bpy.ops.mesh.primitive_cylinder_add(vertices=6,radius=r,depth=v.length,location=(av+bv)/2);o=bpy.context.object;o.rotation_euler=v.to_track_quat('Z','Y').to_euler();o.data.materials.append(mat)
cube('Floor',(0,0,-.08),(16,16,.12))
if plan.get('room')=='arch':
    for i in range(10):
        a=(i+.5)*math.pi/10;o=cube('Arch',(2+math.cos(a)*2,2,2+math.sin(a)*2),(.73,.55,.8));o.rotation_euler.y=math.pi/2-a
    cube('Arch left',(0,2,1),(1,.55,2));cube('Arch right',(4,2,1),(1,.55,2))
else:cube('Back wall',(0,3,2.4),(14,.15,5))
for i,s in enumerate(plan['subjects']):
    x=(float(s['x'])-.5)*5;y=(float(s['bottom'])-.8)*4
    assert -3<=x<=3 and -4<=y<=4
    if s['kind']=='product':
        cube('Product',(x,y,.6),(.45,.4,1.2));continue
    ball('Head',(x,y,1.64),.13);cube('Torso',(x,y,1.24),(.34,.22,.48));cube('Pelvis',(x,y,.92),(.25,.18,.19))
    for sign in [-1,1]:
        for a,b,r in [((sign*.12,0,.91),(sign*.14,.01,.51),.075),((sign*.14,.01,.51),(sign*.16,.03,.09),.055),((sign*.21,0,1.43),(sign*.29,.01,1.13),.055),((sign*.29,.01,1.13),(sign*.18,.11,.94),.045)]:
            aa=(x+a[0],y+a[1],a[2]);bb=(x+b[0],y+b[1],b[2]);limb(aa,bb,r);ball('Joint',aa,r*1.15)
        cube('Foot',(x+sign*.16,y+.09,.05),(.12,.23,.1))
az=math.radians(float(camera.get('az',0)));el=math.radians(float(camera.get('el',5)));d=float(camera.get('distance',6));assert 1.5<=d<=20
bpy.ops.object.camera_add(location=(math.sin(az)*math.cos(el)*d,-math.cos(az)*math.cos(el)*d,1+math.sin(el)*d));cam=bpy.context.object;cam.name='Shotfix camera';cam.data.lens=float(camera.get('focal',35));cam.rotation_euler=(Vector((0,0,1))-cam.location).to_track_quat('-Z','Y').to_euler();bpy.context.scene.camera=cam
bpy.ops.object.light_add(type='AREA',location=(-4,-4,7));light=bpy.context.object;light.data.energy=1100;light.data.shape='DISK';light.data.size=5;light.rotation_euler=(Vector((0,0,1))-light.location).to_track_quat('-Z','Y').to_euler()
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=12;scene.cycles.device='CPU';scene.render.resolution_x=640;scene.render.resolution_y=360;scene.render.resolution_percentage=100;scene.world.color=(.25,.25,.25);scene.render.image_settings.file_format='PNG';scene.render.filepath=str(out/'guide.png')
bpy.ops.wm.save_as_mainfile(filepath=str(out/'guide.blend'));bpy.ops.export_scene.gltf(filepath=str(out/'guide.glb'),export_format='GLB');bpy.ops.render.render(write_still=True)
print(json.dumps({'blend':str(out/'guide.blend'),'glb':str(out/'guide.glb'),'image':str(out/'guide.png')}))
