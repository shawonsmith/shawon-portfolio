from pathlib import Path
from PIL import Image
import json
root=Path(__file__).resolve().parents[2]
assets=root/'dist/assets/characters';assets.mkdir(parents=True,exist_ok=True)
source=root/'source-assets/personalized'
m=json.loads((source/'replacement-map.json').read_text())
p=root/'dist/index.html';s=p.read_text();records=[]
for pose,files in m.items():
 image=Image.open(source/('stand.png' if pose=='gesture' else pose+'.png')).convert('RGBA')
 for name in files:
  old=root/'dist/_assets/media'/name
  targetsize=Image.open(old).size
  path='assets/characters/shawon-'+pose+'-'+str(targetsize[0])+'x'+str(targetsize[1])+'-v2.png'
  image.resize(targetsize,Image.Resampling.LANCZOS).save(root/'dist'/path,optimize=True)
  oldurl='_assets/media/'+name
  count=s.count(oldurl)
  assert count>0,oldurl
  s=s.replace(oldurl,path)
  records.append({'original':oldurl,'replacement':path,'references':count,'pose':pose})
s=s.replace('/assets/shawon-hero.mp4','/assets/shawon-hero-animated-v2.mp4').replace('/assets/shawon-hero-poster.jpg','/assets/shawon-hero-animated-v2.jpg')
s=s.replace("value.dashVideoFiles = [];", "value.durationSeconds = 12;\n      value.dashVideoFiles = [];")
p.write_text(s)
(source/'replacement-audit.json').write_text(json.dumps(records,indent=2))
print('Replaced',len(records),'old image variants across',sum(r['references'] for r in records),'references')
