import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {Presentation, PresentationFile} from '@oai/artifact-tool';

process.env.RUNTIME_NODE_MODULES='C:/Users/hccga/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const workspaceDir=path.resolve('../..');
const SKILL_DIR='C:/Users/hccga/.codex/plugins/cache/openai-primary-runtime/presentations/26.909.12148/skills/presentations';
const PYTHON='C:/Users/hccga/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe';
const {finalizePresentation}=await import(pathToFileURL(path.join(SKILL_DIR,'container_tools/artifact_tool_utils.mjs')).href);
const P=Presentation.create({slideSize:{width:1280,height:720}});
const C={cream:'#F4E6CA',orange:'#B85B35',mustard:'#D2A442',olive:'#69734A',espresso:'#30251E',muted:'#74614C',light:'#FBF4E5'};
const notes=[];
function text(slide,content,x,y,w,h,size=28,{font='Arial',color=C.espresso,bold=false,align='left'}={}){
 const s=slide.shapes.add({geometry:'textbox',name:content.slice(0,60),position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});
 s.text=content;s.text.style={typeface:font,fontSize:size,color,bold,alignment:align,autoFit:'none'};return s;
}
function base(title,bg=C.cream){const s=P.slides.add();s.background.fill=bg;text(s,title,64,44,1120,92,50,{font:'Georgia',color:bg===C.espresso||bg===C.olive?C.cream:C.espresso});if(title!=='Visual direction')text(s,String(P.slides.items.length).padStart(2,'0'),1190,664,40,26,17,{color:bg===C.espresso||bg===C.olive?C.cream:C.muted,align:'right'});return s;}
function note(s,title,seconds,body,sources=[]){const content=`${seconds?`Presentation time: ${seconds} seconds.\n\n`: 'Q&A backup. Not part of the timed presentation.\n\n'}${body}${sources.length?'\n\nSources:\n'+sources.join('\n'):''}`;s.speakerNotes.textFrame.setText(content);notes.push({title,seconds,body,sources});}
function table(s,values,x,y,w,h,widths,{size=24,header=C.espresso}={}){const t=s.tables.add({rows:values.length,columns:values[0].length,left:x,top:y,width:w,height:h,columnWidths:widths,values});t.borders.assign({fill:'#D2C0A1',width:.7,style:'solid'});for(let r=0;r<values.length;r++){t.rows[r].height=h/values.length;for(let c=0;c<values[0].length;c++){const cell=t.getCell(r,c);cell.fill=r===0?header:(r%2?C.light:C.cream);cell.text.style={typeface:'Arial',fontSize:size,color:r===0?C.cream:C.espresso,bold:r===0};}}return t;}
const cover=await fs.readFile('../assets/felt-and-fortune-cover.png');
const reference=await fs.readFile('../assets/monograph-user-reference.png');

// 1. Cover. All typography remains editable.
{
 const s=P.slides.add();s.background.fill=C.cream;s.images.add({blob:cover,contentType:'image/png',alt:'Original retro playing-card illustration',fit:'cover',position:{left:0,top:0,width:1280,height:720}});
 text(s,'Felt &\nFortune',64,171,660,225,91,{font:'Georgia'});
 text(s,'Free blackjack practice\nand performance tools',70,418,540,91,31);
 text(s,'Henry Chambers',70,590,510,38,25,{bold:true});text(s,'Project proposal   /   Fall 2026',70,634,550,30,20,{color:C.muted});
 note(s,'Felt & Fortune',25,'My project is Felt & Fortune, a free website for blackjack practice and performance analysis. I am building it as a solo project. The goal is to connect learning, practice, simulations, and results tracking in one interface. Today I will explain the problem, the design, and how I plan to evaluate and finish it by November 30.', ['Project scope and solo ownership: Henry Chambers, user instructions, September 21, 2026.','Cover: original AI-generated decorative artwork. It depicts a concept, not a product screenshot.']);
}
// 2. Problem.
{
 const s=base('The problem');
 text(s,'Learning the rules is easier\nthan measuring progress.',64,160,1110,125,46,{font:'Georgia',color:C.orange});
 const items=[['Practice needs feedback','Learners need to identify mistakes and repeat difficult decisions.'],['Results can be misleading','A profitable session can reflect luck rather than consistent decisions.'],['Tools add friction','Switching between charts, calculators, and logs interrupts the learning process.']];
 items.forEach(([h,b],i)=>{text(s,h,70,328+i*100,330,55,27,{bold:true});text(s,b,430,328+i*100,760,68,28);});
 text(s,'Problem hypothesis: validate these needs through peer testing.',70,654,1080,28,20,{color:C.muted});
 note(s,'The problem',55,'The target user is someone learning blackjack strategy or trying to practice more consistently. Memorizing a chart is only one part of that process. A learner also needs feedback on individual decisions and a way to see which skills still need work. Another issue is that short-term results can hide mistakes. Someone can win a session while making poor decisions, or lose while following a sound strategy. Existing tools already address parts of this problem, but the learning process can still involve separate charts, calculators, and spreadsheets. My hypothesis is that a more connected workflow can reduce that friction. I will test that hypothesis with classmates rather than assume every learner has the same needs.');
}
// 3. Existing solutions.
{
 const s=base('Existing solutions');
 table(s,[['Solution','What it already provides','Opportunity for this project'],['AP Toolbox','Training, simulation tools, tracking, and community','Permanent free access'],['Blackjack.tools','Free calculators, strategy practice, tracking, and forums','A guided practice workflow and distinct interface'],['Spreadsheets','Flexible session logs and custom calculations','Built-in drills, feedback, and fewer setup steps']],64,169,1152,355,[240,465,447],{size:25});
 text(s,'Free access already exists in this category.',70,565,1120,46,31,{font:'Georgia',color:C.orange});
 text(s,'Felt & Fortune will compete on clarity, practice flow, and original design.',70,617,1090,44,25);
 note(s,'Existing solutions',65,'I researched AP Toolbox and Blackjack.tools as the closest examples. AP Toolbox combines training, simulations, tracking, and community features. Its public page advertised a subscription after a trial when I inspected it. Blackjack.tools is especially important because it already offers free tools, including calculators, strategy practice, a results tracker, and forums. That means I cannot honestly claim that free access alone makes this project unique. Spreadsheets are another practical alternative for logging results, although the user must build the structure and calculations. My contribution is an independently built interface that connects these tasks around a clear practice workflow. I will use the existing products to understand common requirements, while developing my own visual identity and implementation.', ['https://www.ap-toolbox.com/ — public feature and subscription descriptions observed September 14, 2026. Signed-in tools were unavailable.','https://blackjack.tools/ — public feature and free-access descriptions checked September 21, 2026.','Spreadsheet comparison: design analysis, not a measured usability finding.']);
}
// 4. User journey.
{
 const s=base('The proposed experience',C.olive);
 const rows=[['01','Learn','Study the rules and strategy charts.'],['02','Practice','Complete drills and review immediate feedback.'],['03','Model','Explore how rules and bet spreads affect simulated outcomes.'],['04','Reflect','Log sessions and compare results over time.']];
 rows.forEach(([n,h,b],i)=>{text(s,n,66,178+i*111,78,70,43,{font:'Georgia',color:C.mustard});text(s,h,176,181+i*111,225,61,36,{font:'Georgia',color:C.cream});text(s,b,451,184+i*111,720,77,29,{color:C.cream});});
 note(s,'The proposed experience',60,'The main user journey has four stages. First, the user studies the rules and charts. Second, the user practices specific skills such as basic strategy or keeping a running count. The application gives immediate feedback and records accuracy. Third, the user changes a simulation setting, such as table rules or a bet spread, to explore how the model behaves. Finally, the user reviews sessions and progress over time. A typical path might begin with a mistake in a practice drill, continue with another attempt, and end with a clearer understanding of the correct decision. The website does not need the user to place a wager to complete that learning loop. The design question is whether the transitions between these stages feel clear and useful.');
}
// 5. Scope.
{
 const s=base('Feature scope');
 text(s,'Release priorities',68,160,550,60,35,{font:'Georgia',color:C.orange});
 text(s,'Guided lessons and strategy charts\nBasic strategy and counting drills\nEV and Monte Carlo simulations\nSession logging with CSV import/export',70,247,536,278,29);
 text(s,'Broader feature set',688,160,510,60,35,{font:'Georgia',color:C.olive});
 text(s,'Deck estimation and deviations\nCheckouts and career progress\nShared bankrolls and permissions\nGame directory, forum, and messages',690,247,510,278,29);
 text(s,'Every feature is free to end users.',70,563,1100,47,34,{font:'Georgia'});
 text(s,'The project supports education and analysis. It does not process wagers.',70,625,1090,32,23,{color:C.muted});
 note(s,'Feature scope',55,'The planned feature set is broad, so I need a clear delivery order. My first priority is a complete core journey: learn a concept, practice it, run a simulation, and save a session. That includes charts, training feedback, calculation controls, and data import and export. The broader feature set includes deck estimation, deviations, checkouts, progress tracking, and community tools. Shared bankrolls also require careful permission handling because one user should not be able to access another person’s private records. Some of these modules already exist in the prototype, but implementation is different from being ready for release. I will stabilize the core experience first, then validate the wider feature set. All access remains free, and the site does not accept or execute wagers.');
}
// 6. Visual design, supplied inspiration retained as evidence.
{
 const s=base('Visual direction');
 text(s,'A 1970s palette with\nmodern navigation',66,154,548,106,39,{font:'Georgia',color:C.orange});
 text(s,'Large editorial typography\nGenerous spacing and warm gradients\nReadable tool collections and navigation',70,295,520,169,27);
 text(s,'Monograph informs typography.\nStake.us informs tool discovery.\nFelt & Fortune has its own identity.',70,494,535,105,24,{color:C.muted});
 s.images.add({blob:reference,contentType:'image/png',alt:'User-supplied Monograph typography and layout reference',fit:'contain',position:{left:656,top:154,width:554,height:442}});
 text(s,'User-supplied visual reference',662,598,542,25,17,{color:C.muted});
 const palette=table(s,[['Cream\n#F4E6CA','Burnt orange\n#B85B35','Mustard\n#D2A442','Olive\n#69734A','Espresso\n#30251E']],66,647,1144,55,[228.8,228.8,228.8,228.8,228.8],{size:17});
 [C.cream,C.orange,C.mustard,C.olive,C.espresso].forEach((color,i)=>{palette.getCell(0,i).fill=color;palette.getCell(0,i).text.style={typeface:'Arial',fontSize:17,color:[1,3,4].includes(i)?C.cream:C.espresso,bold:false};});
 note(s,'Visual direction',55,'The visual direction has changed from closely matching AP Toolbox to creating an original identity. Felt & Fortune will use a 1970s color palette with cream, burnt orange, mustard, olive, and espresso. The supplied Monograph example suggests large editorial type and generous spacing. I also want to borrow general discovery patterns from Stake.us, such as clear navigation and browsable collections of activities. The subject matter and behavior remain educational tools. The screenshot here is a design reference, not a screenshot of my final website. The current prototype still needs its complete visual redesign. I will also check contrast, keyboard access, and small-screen layouts so that the retro aesthetic does not interfere with using the tools.', ['Monograph screenshot supplied by Henry Chambers, September 21, 2026. Shown for design reference.','https://stake.us/ — public navigation and category layout checked September 21, 2026.','Palette and proposed identity: original design direction for this project.']);
}
// 7. Architecture and status.
{
 const s=base('Implementation plan');
 table(s,[['Layer','Responsibility'],['Browser interface','Responsive HTML, CSS, and JavaScript for tools and charts'],['Python application server','Authentication, input validation, permissions, and simulation jobs'],['SQLite database','Users, sessions, bankrolls, training records, and community data']],66,164,1148,310,[365,783],{size:27});
 text(s,'Prototype modules exist',70,522,1110,50,33,{font:'Georgia',color:C.orange});
 text(s,'The redesign, broader validation, and deployment preparation remain in progress.',70,581,1110,74,28);
 note(s,'Implementation plan',60,'The current architecture is intentionally small enough for a solo semester project. The browser handles the interface using HTML, CSS, and JavaScript. A Python server handles authentication, permissions, validation, and simulation jobs. SQLite stores the application data. The prototype already includes modules for training, tracking, collaboration, and simulations, so this proposal builds on an initial implementation rather than starting from a blank repository. However, I am not treating those modules as finished. The next work includes the original visual design, integration testing, and validation of mathematical assumptions. Keeping a small stack reduces setup complexity, but it also means I need to document deployment limits and backup requirements. Email recovery still needs an email service, and public hosting would be a separate deployment step.', ['Implementation evidence: public/app.js, public/styles.css, server.py, and engine.py in the project workspace.','Status reflects the prototype as of September 21, 2026, not a production release.']);
}
// 8. Evaluation.
{
 const s=base('Evaluation plan');
 table(s,[['Question','Method','Proposed acceptance target'],['Are the decisions correct?','Rule fixtures and published strategy checks','All supported-rule fixtures pass'],['Can users finish key tasks?','5–8 peers complete four core tasks','At least 90% task completion'],['Do users understand results?','Explain a simulation confidence interval','At least 80% explain it correctly'],['Is private data protected?','Tests with unrelated users and team roles','All isolation and permission tests pass'],['Does it work on small screens?','Keyboard review and four viewport widths','No blocked core task or page overflow']],64,157,1152,431,[342,407,403],{size:23});
 text(s,'Targets describe the evaluation plan. User testing has not happened yet.',70,621,1095,45,23,{color:C.muted});
 note(s,'Evaluation plan',75,'I will evaluate correctness, usability, interpretation, privacy, and responsive behavior. For correctness, I will test supported strategy decisions against documented fixtures and compare simulation behavior with published benchmarks under matching assumptions. For usability, I plan to recruit five to eight peers and ask each person to find a drill, complete it, run a simulation, and save a session. The target is at least ninety percent completion across those tasks. I will record errors and where people hesitate. I also want at least eighty percent of participants to explain what a confidence interval means, because showing a number is not enough if users misread it. Permission tests will cover unrelated users, viewers, editors, and bankroll owners. Finally, I will check keyboard use and layouts at 390, 768, 1024, and 1440 pixels. These are proposed targets, not results from a completed study.', ['All participant counts and acceptance thresholds are proposed evaluation targets.','Strategy reference: https://wizardofodds.com/games/blackjack/strategy/4-decks/','Variance reference: https://wizardofodds.com/games/blackjack/variance/']);
}
// 9. Solo ownership.
{
 const s=base('Solo ownership and feedback');
 text(s,'Henry Chambers',70,156,1090,62,43,{font:'Georgia',color:C.orange});
 table(s,[['Workstream','Responsibility'],['Product and design','Requirements, user flows, visual identity, and accessibility'],['Implementation','Interface, server, database, training, and simulation logic'],['Quality and delivery','Test cases, usability sessions, documentation, and final demo']],68,255,1140,277,[365,775],{size:25});
 text(s,'Feedback plan',70,573,280,48,30,{font:'Georgia'});
 text(s,'Weekly self-review. Instructor checkpoints. Peer usability sessions.\nOne task board and small, reviewable changes.',380,573,825,81,25);
 note(s,'Solo ownership and feedback',60,'This is a solo project, so I am responsible for every workstream. That includes defining requirements, designing the interface, writing and integrating the application, checking the calculations, and preparing the final demonstration. My collaboration plan is therefore a feedback plan rather than a division of coding responsibilities. I will keep one task board and review progress each week. I will bring scope and design questions to instructor checkpoints, then invite peers to complete usability tasks once the core workflow is stable. Peer participants provide feedback rather than serving as development teammates. I also plan to keep changes small enough to understand and review, with reproducible test steps. Using development tools does not remove my responsibility to understand the implementation or validate the behavior I present.');
}
// 10. Actual dates.
{
 const s=base('Timeline to November 30');
 table(s,[['Dates in 2026','Main work','Checkpoint'],['Sep 21–27','Proposal, requirements, and scope','Proposal and test plan'],['Sep 28–Oct 11','Original identity and responsive interface','Reviewed design and core screens'],['Oct 12–Nov 1','Training, tracking, and simulation integration','Complete core workflow'],['Nov 2–15','Shared features and peer usability sessions','Findings and prioritized fixes'],['Nov 16–22','Correctness, accessibility, and regression tests','Release candidate'],['Nov 23–30','Buffer, documentation, rehearsal, and delivery','Final submission by Nov 30']],64,160,1152,430,[237,548,367],{size:23});
 text(s,'The final week protects time for fixes and rehearsal.',70,628,1080,41,27,{font:'Georgia',color:C.orange});
 note(s,'Timeline to November 30',65,'The schedule works backward from the November thirtieth deadline. In the first week I will finish the proposal and confirm the requirements and evaluation plan. The next two weeks focus on the original identity and responsive interface. From October twelfth through November first, I will integrate and stabilize the core workflow across training, tracking, and simulations. Early November is for shared features and peer usability sessions, followed by a period dedicated to correctness, accessibility, and regression testing. The final week is reserved for documentation, rehearsal, and unexpected fixes. These dates are a proposed plan rather than a claim that the work is already complete. If the scope becomes too large, I will protect the validated core workflow and reduce polish on secondary features before sacrificing the quality of the main tasks.', ['Deadline: November 30, supplied by Henry Chambers. Year 2026 follows the current semester context.','Phase dates and checkpoints are proposed planning estimates.']);
}
// 11. Close, exact total timed section = 600 seconds.
{
 const s=base('Felt & Fortune',C.espresso);
 text(s,'A free place to build\nbetter blackjack habits.',68,194,1138,164,65,{font:'Georgia',color:C.cream});
 text(s,'Success means accurate tools, clear feedback,\nand a workflow people can complete confidently.',73,423,1090,103,32,{color:C.cream});
 text(s,'Questions',74,610,710,55,35,{font:'Georgia',color:C.mustard});
 note(s,'Felt & Fortune',25,'Felt & Fortune brings free practice and analysis into one original interface. I will judge the project by the accuracy of its supported tools and whether users can complete and understand the main workflow. I have a working prototype to build on, a defined evaluation plan, and a November thirtieth deadline. I am ready for your questions.');
}
// Backup A.
{
 const s=base('Q&A: scope and differentiation');
 const entries=[['Why build this when free tools exist?','The project explores a guided learning workflow and an original interface. Evaluation will test whether users find that useful.'],['How will a solo developer manage the scope?','The core learning and tracking workflow gets priority. Shared features follow after permissions and data handling pass tests.'],['What has already been completed?','An initial Python/SQLite prototype exists. The final visual design, user study, and release validation remain.']];
 entries.forEach(([q,a],i)=>{text(s,q,68,166+i*159,1125,56,29,{bold:true,color:C.orange});text(s,a,72,225+i*159,1103,91,27);});
 note(s,'Q&A: scope and differentiation',0,'Use these answers if asked about novelty, feasibility, or prototype status. Do not claim that this is the first free blackjack toolkit. Acknowledge Blackjack.tools as an existing free option. Explain that a student project can contribute through design, integration, and careful evaluation without inventing a new mathematical method. If asked about development assistance, describe the tools used and your review process honestly, following the course policy.');
}
// Backup B.
{
 const s=base('Q&A: accuracy, data, and cost');
 const entries=[['How will you avoid misleading calculations?','Document supported rules, use reproducible seeds, test known decisions, and display simulation uncertainty.'],['Where will community data come from?','Users submit reports and discussions. The project starts with empty community data rather than copied or fabricated records.'],['How can the site stay free?','Users pay nothing. Hosting, email, backups, and maintenance remain operating costs that the developer must plan for.']];
 entries.forEach(([q,a],i)=>{text(s,q,68,166+i*159,1125,56,29,{bold:true,color:C.olive});text(s,a,72,225+i*159,1103,91,27);});
 note(s,'Q&A: accuracy, data, and cost',0,'Expected value is the average outcome under the model’s assumptions. A confidence interval expresses sampling uncertainty in that estimate, and it is not the same as the range of possible session outcomes. The current engine supports a documented subset of blackjack rules. Do not imply professional certification or support for every casino variation. Community reports need dates and authors because conditions can change. The local stack has no required paid software dependencies, but public hosting and email may have costs. The project has no wagering, deposit, or withdrawal system.');
}
// Backup C.
{
 const s=base('Research references');
 const refs=[['AP Toolbox','https://www.ap-toolbox.com/','Feature scope and subscription model'],['Blackjack.tools','https://blackjack.tools/','Free tools and authenticated workflow research'],['Stake.us','https://stake.us/','Navigation and activity-discovery inspiration'],['Wizard of Odds','wizardofodds.com/games/blackjack/strategy/4-decks/','Strategy checks and documented rules'],['Wizard of Odds','wizardofodds.com/games/blackjack/variance/','Variance and simulation validation']];
 refs.forEach(([n,u,p],i)=>{text(s,n,69,157+i*88,285,46,26,{bold:true});text(s,u,371,154+i*88,820,43,24,{color:C.orange});text(s,p,372,188+i*88,810,35,21,{color:C.muted});});
 text(s,'Visual reference supplied by Henry Chambers. Cover artwork is original and AI-generated.',70,636,1100,46,20,{color:C.muted});
 note(s,'Research references',0,'The product comparison distinguishes observations from proposed design choices. AP Toolbox public pages informed feature scope, but its private tools were unavailable because the user did not want a trial. An authorized Blackjack.tools session provided workflow examples without copying its private user data. Stake.us serves only as a visual discovery reference. The Monograph screenshot came from the user. Source-specific citations also appear in the relevant slide notes.',refs.map(x=>x[1]));
}

await fs.mkdir('renders',{recursive:true});
for(let i=0;i<P.slides.items.length;i++){
 const slide=P.slides.items[i];
 const png=await P.export({slide,format:'png',scale:1});
 await fs.writeFile(`renders/slide-${String(i+1).padStart(2,'0')}.png`,new Uint8Array(await png.arrayBuffer()));
 const layout=await slide.export({format:'layout'});await fs.writeFile(`renders/slide-${String(i+1).padStart(2,'0')}.layout.json`,await layout.text());
}
await fs.writeFile('deck.json',JSON.stringify(P.toProto()));
const candidatePath=path.resolve('candidate.pptx');
await (await PresentationFile.exportPptx(P)).save(candidatePath);
const output=path.resolve('../output/Felt_and_Fortune_Proposal_Project_Slides.pptx');
await finalizePresentation({workspaceDir,candidatePath,finalPath:output,pythonExecutable:PYTHON,integrityValidatorPath:path.join(SKILL_DIR,'container_tools/inspect_presentation_package_integrity.py'),layoutValidatorPath:path.join(SKILL_DIR,'container_tools/inspect_presentation_layout_geometry.py'),layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-bullet-geometry','--validate-heading-fit',...[3,6,7,8,9,10].flatMap(n=>['--require-native-table-slide',String(n)])],requiredNativeTableOwnerSlides:[3,6,7,8,9,10],fontPolicy:{basis:'design',families:['Arial','Georgia']},verifyArtifactToolImport:true,receiptPath:path.resolve('validation.json')});
await fs.writeFile('../output/Presenter_Notes.md',`# Felt & Fortune\n\nHenry Chambers · Solo project\n\n11 presentation slides, 10 minutes total. Slides 12–14 are Q&A backups.\n\n${notes.map((n,i)=>`## ${i+1}. ${n.title}${n.seconds?' ('+n.seconds+' seconds)':' (backup)'}\n\n${n.body}\n\n${n.sources.length?'Sources: '+n.sources.join('\n\n'):''}`).join('\n\n')}`);
console.log(JSON.stringify({output,slides:P.slides.items.length,seconds:notes.reduce((t,n)=>t+n.seconds,0)}));


