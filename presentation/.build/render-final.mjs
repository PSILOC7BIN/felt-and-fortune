import fs from 'node:fs/promises';
import {FileBlob, PresentationFile} from '@oai/artifact-tool';
const p=await PresentationFile.importPptx(await FileBlob.load('../output/Felt_and_Fortune_Proposal_Project_Slides.pptx'));
await fs.mkdir('final-renders',{recursive:true});
for(let i=0;i<p.slides.items.length;i++){
 const b=await p.export({slide:p.slides.items[i],format:'png',scale:1});
 await fs.writeFile(`final-renders/slide-${String(i+1).padStart(2,'0')}.png`,new Uint8Array(await b.arrayBuffer()));
}
console.log(`Rendered ${p.slides.items.length} final slides`);
