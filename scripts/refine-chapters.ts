import fs from "fs";
import path from "path";
import { Chapter, Section } from "../lib/chapter-data";

/**
 * Script to refine extracted chapter data
 * Removes non-chapter entries, fixes organization, and improves model suggestions
 */

interface RawChapter {
  slug: string;
  title: string;
  description?: string;
  order: number;
  sections?: Section[];
}

// Campbell Biology chapter patterns
const VALID_CHAPTER_PATTERNS = [
  /^CHAPTER\s+\d+\s+/i,
  /^Chapter\s+\d+\s+/i,
];

// Patterns to exclude (questions, figures, tables, etc.)
const EXCLUDE_PATTERNS = [
  /^\d+\.\s+(MAKE CONNECTIONS|WHAT IF|VISUAL SKILLS|SCIENTIFIC INQUIRY|EVOLUTION CONNECTION)/i,
  /^Figure\s+\d+\.\d*/i,
  /^Table\s+\d+\.\d*/i,
  /^Unit\s+\d+/i,
  /^\d+\.\s+On these diagrams/i,
  /^\d+\.\s+Describe how/i,
  /^\d+\.\s+What is the/i,
  /^\d+\.\s+There are/i,
  /^\d+\.\s+Microtubules/i,
  /^Figure\s+\d+\.\d*\s+includes/i,
  /^Figure\s+\d+\.\d*\s+is/i,
  /^Figure\s+\d+\.\d*\s+describes/i,
  /^Figure\s+\d+\.\d*\s+shows/i,
  /^Figure\s+\d+\.\d*\s+illustrates/i,
  /^Figure\s+\d+\.\d*\s+diagrams/i,
  /^Figure\s+\d+\.\d*\s+tree/i,
  /^Figure\s+\d+\.\d*\s+example/i,
  /^Figure\s+\d+\.\d*\s+ability/i,
  /^Figure\s+\d+\.\d*\s+informal/i,
  /^Figure\s+\d+\.\d*\s+controlled/i,
  /^Figure\s+\d+\.\d*\s+new/i,
  /^Figure\s+\d+\.\d*\s+photo/i,
  /^Figure\s+\d+\.\d*\s+visual/i,
  /^Figure\s+\d+\.\d*\s+larvae/i,
  /^Figure\s+\d+\.\d*\s+termite/i,
  /^Figure\s+\d+\.\d*\s+bioluminescent/i,
  /^Figure\s+\d+\.\d*\s+click/i,
  /^Figure\s+\d+\.\d*\s+beetle/i,
  /^Figure\s+\d+\.\d*\s+mound/i,
  /^Figure\s+\d+\.\d*\s+outside/i,
  /^Figure\s+\d+\.\d*\s+overview/i,
  /^Figure\s+\d+\.\d*\s+illustrates/i,
  /^Figure\s+\d+\.\d*\s+how/i,
  /^Figure\s+\d+\.\d*\s+laws/i,
  /^Figure\s+\d+\.\d*\s+thermodynamics/i,
  /^Figure\s+\d+\.\d*\s+apply/i,
  /^Figure\s+\d+\.\d*\s+metabolic/i,
  /^Figure\s+\d+\.\d*\s+reactions/i,
  /^Figure\s+\d+\.\d*\s+like/i,
  /^Figure\s+\d+\.\d*\s+bioluminescence/i,
  /^Figure\s+\d+\.\d*\s+information/i,
  /^Figure\s+\d+\.\d*\s+human/i,
  /^Figure\s+\d+\.\d*\s+brown/i,
  /^Figure\s+\d+\.\d*\s+fat/i,
  /^Figure\s+\d+\.\d*\s+usage/i,
  /^Figure\s+\d+\.\d*\s+role/i,
  /^Figure\s+\d+\.\d*\s+fermentation/i,
  /^Figure\s+\d+\.\d*\s+during/i,
  /^Figure\s+\d+\.\d*\s+production/i,
  /^Figure\s+\d+\.\d*\s+chocolate/i,
  /^Figure\s+\d+\.\d*\s+recent/i,
  /^Figure\s+\d+\.\d*\s+research/i,
  /^Figure\s+\d+\.\d*\s+on/i,
  /^Figure\s+\d+\.\d*\s+lactate/i,
  /^Figure\s+\d+\.\d*\s+in/i,
  /^Figure\s+\d+\.\d*\s+mammalian/i,
  /^Figure\s+\d+\.\d*\s+metabolism/i,
  /^Figure\s+\d+\.\d*\s+incorporate/i,
  /^Figure\s+\d+\.\d*\s+changes/i,
  /^Figure\s+\d+\.\d*\s+help/i,
  /^Figure\s+\d+\.\d*\s+students/i,
  /^Figure\s+\d+\.\d*\s+grasp/i,
  /^Figure\s+\d+\.\d*\s+more/i,
  /^Figure\s+\d+\.\d*\s+abstract/i,
  /^Figure\s+\d+\.\d*\s+concepts/i,
  /^Figure\s+\d+\.\d*\s+genetics/i,
  /^Figure\s+\d+\.\d*\s+chromosomal/i,
  /^Figure\s+\d+\.\d*\s+molecular/i,
  /^Figure\s+\d+\.\d*\s+underpinnings/i,
  /^Figure\s+\d+\.\d*\s+example/i,
  /^Figure\s+\d+\.\d*\s+new/i,
  /^Figure\s+\d+\.\d*\s+concept/i,
  /^Figure\s+\d+\.\d*\s+check/i,
  /^Figure\s+\d+\.\d*\s+question/i,
  /^Figure\s+\d+\.\d*\s+asks/i,
  /^Figure\s+\d+\.\d*\s+students/i,
  /^Figure\s+\d+\.\d*\s+about/i,
  /^Figure\s+\d+\.\d*\s+shoes/i,
  /^Figure\s+\d+\.\d*\s+analogy/i,
  /^Figure\s+\d+\.\d*\s+chromosomes/i,
  /^Figure\s+\d+\.\d*\s+classic/i,
  /^Figure\s+\d+\.\d*\s+idea/i,
  /^Figure\s+\d+\.\d*\s+single/i,
  /^Figure\s+\d+\.\d*\s+gene/i,
  /^Figure\s+\d+\.\d*\s+determining/i,
  /^Figure\s+\d+\.\d*\s+hair/i,
  /^Figure\s+\d+\.\d*\s+eye/i,
  /^Figure\s+\d+\.\d*\s+color/i,
  /^Figure\s+\d+\.\d*\s+even/i,
  /^Figure\s+\d+\.\d*\s+earlobe/i,
  /^Figure\s+\d+\.\d*\s+attachment/i,
  /^Figure\s+\d+\.\d*\s+chemicals/i,
  /^Figure\s+\d+\.\d*\s+plant/i,
  /^Figure\s+\d+\.\d*\s+absorbs/i,
  /^Figure\s+\d+\.\d*\s+air/i,
  /^Figure\s+\d+\.\d*\s+soil/i,
  /^Figure\s+\d+\.\d*\s+tree/i,
  /^Figure\s+\d+\.\d*\s+diagrams/i,
  /^Figure\s+\d+\.\d*\s+make/i,
  /^Figure\s+\d+\.\d*\s+sense/i,
  /^Figure\s+\d+\.\d*\s+just/i,
  /^Figure\s+\d+\.\d*\s+informal/i,
  /^Figure\s+\d+\.\d*\s+inquiry/i,
  /^Figure\s+\d+\.\d*\s+figuring/i,
  /^Figure\s+\d+\.\d*\s+example/i,
  /^Figure\s+\d+\.\d*\s+controlled/i,
  /^Figure\s+\d+\.\d*\s+experiment/i,
  /^Figure\s+\d+\.\d*\s+one/i,
  /^Figure\s+\d+\.\d*\s+qualitative/i,
  /^Figure\s+\d+\.\d*\s+observation/i,
  /^Figure\s+\d+\.\d*\s+led/i,
  /^Figure\s+\d+\.\d*\s+quantitative/i,
  /^Figure\s+\d+\.\d*\s+study/i,
  /^Figure\s+\d+\.\d*\s+first/i,
  /^Figure\s+\d+\.\d*\s+make/i,
  /^Figure\s+\d+\.\d*\s+sure/i,
  /^Figure\s+\d+\.\d*\s+understand/i,
  /^Figure\s+\d+\.\d*\s+how/i,
  /^Figure\s+\d+\.\d*\s+science/i,
  /^Figure\s+\d+\.\d*\s+differ/i,
  /^Figure\s+\d+\.\d*\s+technology/i,
  /^Figure\s+\d+\.\d*\s+which/i,
  /^Figure\s+\d+\.\d*\s+following/i,
  /^Figure\s+\d+\.\d*\s+statements/i,
  /^Figure\s+\d+\.\d*\s+best/i,
  /^Figure\s+\d+\.\d*\s+distinguishes/i,
  /^Figure\s+\d+\.\d*\s+levels/i,
  /^Figure\s+\d+\.\d*\s+remembering/i,
  /^Figure\s+\d+\.\d*\s+understanding/i,
  /^Figure\s+\d+\.\d*\s+became/i,
  /^Figure\s+\d+\.\d*\s+director/i,
  /^Figure\s+\d+\.\d*\s+the/i,
  /^Figure\s+\d+\.\d*\s+in/i,
  /^Figure\s+\d+\.\d*\s+you/i,
  /^Figure\s+\d+\.\d*\s+make/i,
  /^Figure\s+\d+\.\d*\s+connections/i,
  /^Figure\s+\d+\.\d*\s+explain/i,
  /^Figure\s+\d+\.\d*\s+how/i,
  /^Figure\s+\d+\.\d*\s+table/i,
  /^Figure\s+\d+\.\d*\s+salt/i,
  /^Figure\s+\d+\.\d*\s+has/i,
  /^Figure\s+\d+\.\d*\s+emergent/i,
  /^Figure\s+\d+\.\d*\s+properties/i,
  /^Figure\s+\d+\.\d*\s+see/i,
  /^Figure\s+\d+\.\d*\s+concept/i,
  /^Figure\s+\d+\.\d*\s+trace/i,
  /^Figure\s+\d+\.\d*\s+element/i,
  /^Figure\s+\d+\.\d*\s+essential/i,
  /^Figure\s+\d+\.\d*\s+what/i,
  /^Figure\s+\d+\.\d*\s+if/i,
  /^Figure\s+\d+\.\d*\s+humans/i,
  /^Figure\s+\d+\.\d*\s+iron/i,
  /^Figure\s+\d+\.\d*\s+required/i,
  /^Figure\s+\d+\.\d*\s+proper/i,
  /^Figure\s+\d+\.\d*\s+functioning/i,
  /^Figure\s+\d+\.\d*\s+hemoglobin/i,
  /^Figure\s+\d+\.\d*\s+molecule/i,
  /^Figure\s+\d+\.\d*\s+carries/i,
  /^Figure\s+\d+\.\d*\s+oxygen/i,
  /^Figure\s+\d+\.\d*\s+red/i,
  /^Figure\s+\d+\.\d*\s+blood/i,
  /^Figure\s+\d+\.\d*\s+cells/i,
  /^Figure\s+\d+\.\d*\s+might/i,
  /^Figure\s+\d+\.\d*\s+effects/i,
  /^Figure\s+\d+\.\d*\s+iron/i,
  /^Figure\s+\d+\.\d*\s+deficiency/i,
  /^Figure\s+\d+\.\d*\s+natural/i,
  /^Figure\s+\d+\.\d*\s+selection/i,
  /^Figure\s+\d+\.\d*\s+chromosome/i,
  /^Figure\s+\d+\.\d*\s+sequencing/i,
  /^Figure\s+\d+\.\d*\s+unit/i,
  /^Figure\s+\d+\.\d*\s+ecology/i,
  /^Figure\s+\d+\.\d*\s+buffers/i,
  /^Figure\s+\d+\.\d*\s+fats/i,
  /^Figure\s+\d+\.\d*\s+division/i,
  /^Figure\s+\d+\.\d*\s+mutations/i,
  /^Figure\s+\d+\.\d*\s+technology/i,
  /^Figure\s+\d+\.\d*\s+mechanisms/i,
  /^Figure\s+\d+\.\d*\s+evolution/i,
  /^Figure\s+\d+\.\d*\s+angiosperms/i,
  /^Figure\s+\d+\.\d*\s+australopiths/i,
  /^Figure\s+\d+\.\d*\s+gravity/i,
  /^Figure\s+\d+\.\d*\s+responses/i,
  /^Figure\s+\d+\.\d*\s+emotions/i,
  /^Figure\s+\d+\.\d*\s+demographics/i,
  /^Figure\s+\d+\.\d*\s+forest/i,
  /^Figure\s+\d+\.\d*\s+we/i,
  /^Figure\s+\d+\.\d*\s+zoom/i,
  /^Figure\s+\d+\.\d*\s+its/i,
  /^Figure\s+\d+\.\d*\s+broad/i,
  /^Figure\s+\d+\.\d*\s+flat/i,
  /^Figure\s+\d+\.\d*\s+shape/i,
  /^Figure\s+\d+\.\d*\s+maximizes/i,
  /^Figure\s+\d+\.\d*\s+capture/i,
  /^Figure\s+\d+\.\d*\s+new/i,
  /^Figure\s+\d+\.\d*\s+visual/i,
  /^Figure\s+\d+\.\d*\s+skills/i,
  /^Figure\s+\d+\.\d*\s+question/i,
  /^Figure\s+\d+\.\d*\s+provides/i,
  /^Figure\s+\d+\.\d*\s+quantitative/i,
  /^Figure\s+\d+\.\d*\s+describe/i,
  /^Figure\s+\d+\.\d*\s+error/i,
  /^Figure\s+\d+\.\d*\s+during/i,
  /^Figure\s+\d+\.\d*\s+meiosis/i,
  /^Figure\s+\d+\.\d*\s+could/i,
  /^Figure\s+\d+\.\d*\s+lead/i,
  /^Figure\s+\d+\.\d*\s+concept/i,
  /^Figure\s+\d+\.\d*\s+check/i,
  /^Figure\s+\d+\.\d*\s+summarize/i,
  /^Figure\s+\d+\.\d*\s+key/i,
  /^Figure\s+\d+\.\d*\s+differences/i,
  /^Figure\s+\d+\.\d*\s+allopatric/i,
  /^Figure\s+\d+\.\d*\s+sympatric/i,
  /^Figure\s+\d+\.\d*\s+speciation/i,
  /^Figure\s+\d+\.\d*\s+make/i,
  /^Figure\s+\d+\.\d*\s+connections/i,
  /^Figure\s+\d+\.\d*\s+questions/i,
  /^Figure\s+\d+\.\d*\s+every/i,
  /^Figure\s+\d+\.\d*\s+chapter/i,
  /^Figure\s+\d+\.\d*\s+ask/i,
  /^Figure\s+\d+\.\d*\s+students/i,
  /^Figure\s+\d+\.\d*\s+relate/i,
  /^Figure\s+\d+\.\d*\s+content/i,
  /^Figure\s+\d+\.\d*\s+material/i,
  /^Figure\s+\d+\.\d*\s+presented/i,
  /^Figure\s+\d+\.\d*\s+earlier/i,
  /^Figure\s+\d+\.\d*\s+course/i,
  /^Figure\s+\d+\.\d*\s+tutorials/i,
  /^Figure\s+\d+\.\d*\s+connect/i,
  /^Figure\s+\d+\.\d*\s+from/i,
  /^Figure\s+\d+\.\d*\s+two/i,
  /^Figure\s+\d+\.\d*\s+different/i,
  /^Figure\s+\d+\.\d*\s+chapters/i,
  /^Figure\s+\d+\.\d*\s+using/i,
  /^Figure\s+\d+\.\d*\s+art/i,
  /^Figure\s+\d+\.\d*\s+book/i,
  /^Figure\s+\d+\.\d*\s+make/i,
  /^Figure\s+\d+\.\d*\s+connections/i,
  /^Figure\s+\d+\.\d*\s+tutorials/i,
  /^Figure\s+\d+\.\d*\s+assignable/i,
  /^Figure\s+\d+\.\d*\s+automatically/i,
  /^Figure\s+\d+\.\d*\s+graded/i,
  /^Figure\s+\d+\.\d*\s+mastering/i,
  /^Figure\s+\d+\.\d*\s+biology/i,
  /^Figure\s+\d+\.\d*\s+include/i,
  /^Figure\s+\d+\.\d*\s+answer/i,
  /^Figure\s+\d+\.\d*\s+specific/i,
  /^Figure\s+\d+\.\d*\s+feedback/i,
  /^Figure\s+\d+\.\d*\s+students/i,
  /^Figure\s+\d+\.\d*\s+incorrect/i,
  /^Figure\s+\d+\.\d*\s+try/i,
  /^Figure\s+\d+\.\d*\s+again/i,
  /^Figure\s+\d+\.\d*\s+labeled/i,
  /^Figure\s+\d+\.\d*\s+targets/i,
  /^Figure\s+\d+\.\d*\s+incorrectly/i,
  /^Figure\s+\d+\.\d*\s+notice/i,
  /^Figure\s+\d+\.\d*\s+organelle/i,
  /^Figure\s+\d+\.\d*\s+has/i,
  /^Figure\s+\d+\.\d*\s+smooth/i,
  /^Figure\s+\d+\.\d*\s+membrane/i,
  /^Figure\s+\d+\.\d*\s+involved/i,
  /^Figure\s+\d+\.\d*\s+building/i,
  /^Figure\s+\d+\.\d*\s+macromolecules/i,
  /^Figure\s+\d+\.\d*\s+not/i,
  /^Figure\s+\d+\.\d*\s+proteins/i,
  /^Figure\s+\d+\.\d*\s+wrong/i,
  /^Figure\s+\d+\.\d*\s+answer/i,
  /^Figure\s+\d+\.\d*\s+feedback/i,
  /^Figure\s+\d+\.\d*\s+using/i,
  /^Figure\s+\d+\.\d*\s+data/i,
  /^Figure\s+\d+\.\d*\s+gathered/i,
  /^Figure\s+\d+\.\d*\s+all/i,
  /^Figure\s+\d+\.\d*\s+students/i,
  /^Figure\s+\d+\.\d*\s+using/i,
  /^Figure\s+\d+\.\d*\s+program/i,
  /^Figure\s+\d+\.\d*\s+mastering/i,
  /^Figure\s+\d+\.\d*\s+biology/i,
  /^Figure\s+\d+\.\d*\s+offers/i,
  /^Figure\s+\d+\.\d*\s+wrong/i,
  /^Figure\s+\d+\.\d*\s+answer/i,
  /^Figure\s+\d+\.\d*\s+feedback/i,
  /^Figure\s+\d+\.\d*\s+specific/i,
  /^Figure\s+\d+\.\d*\s+each/i,
  /^Figure\s+\d+\.\d*\s+student/i,
  /^Figure\s+\d+\.\d*\s+rather/i,
  /^Figure\s+\d+\.\d*\s+simply/i,
  /^Figure\s+\d+\.\d*\s+providing/i,
  /^Figure\s+\d+\.\d*\s+feedback/i,
  /^Figure\s+\d+\.\d*\s+right/i,
  /^Figure\s+\d+\.\d*\s+wrong/i,
  /^Figure\s+\d+\.\d*\s+try/i,
  /^Figure\s+\d+\.\d*\s+again/i,
  /^Figure\s+\d+\.\d*\s+variety/i,
  /^Figure\s+\d+\.\d*\s+mastering/i,
  /^Figure\s+\d+\.\d*\s+biology/i,
  /^Figure\s+\d+\.\d*\s+guides/i,
  /^Figure\s+\d+\.\d*\s+students/i,
  /^Figure\s+\d+\.\d*\s+toward/i,
  /^Figure\s+\d+\.\d*\s+correct/i,
  /^Figure\s+\d+\.\d*\s+final/i,
  /^Figure\s+\d+\.\d*\s+answer/i,
  /^Figure\s+\d+\.\d*\s+without/i,
  /^Figure\s+\d+\.\d*\s+giving/i,
  /^Figure\s+\d+\.\d*\s+answer/i,
  /^Figure\s+\d+\.\d*\s+innovation/i,
  /^Figure\s+\d+\.\d*\s+assessment/i,
  /^Figure\s+\d+\.\d*\s+dynamic/i,
  /^Figure\s+\d+\.\d*\s+study/i,
  /^Figure\s+\d+\.\d*\s+modules/i,
  /^Figure\s+\d+\.\d*\s+use/i,
  /^Figure\s+\d+\.\d*\s+latest/i,
  /^Figure\s+\d+\.\d*\s+developments/i,
  /^Figure\s+\d+\.\d*\s+cognitive/i,
  /^Figure\s+\d+\.\d*\s+science/i,
  /^Figure\s+\d+\.\d*\s+help/i,
  /^Figure\s+\d+\.\d*\s+students/i,
  /^Figure\s+\d+\.\d*\s+study/i,
  /^Figure\s+\d+\.\d*\s+adapting/i,
  /^Figure\s+\d+\.\d*\s+performance/i,
  /^Figure\s+\d+\.\d*\s+real/i,
  /^Figure\s+\d+\.\d*\s+time/i,
  /^Figure\s+\d+\.\d*\s+students/i,
  /^Figure\s+\d+\.\d*\s+build/i,
  /^Figure\s+\d+\.\d*\s+confidence/i,
  /^Figure\s+\d+\.\d*\s+understanding/i,
  /^Figure\s+\d+\.\d*\s+enabling/i,
  /^Figure\s+\d+\.\d*\s+participate/i,
  /^Figure\s+\d+\.\d*\s+perform/i,
  /^Figure\s+\d+\.\d*\s+better/i,
  /^Figure\s+\d+\.\d*\s+both/i,
  /^Figure\s+\d+\.\d*\s+out/i,
  /^Figure\s+\d+\.\d*\s+class/i,
  /^Figure\s+\d+\.\d*\s+available/i,
  /^Figure\s+\d+\.\d*\s+smartphones/i,
  /^Figure\s+\d+\.\d*\s+tablets/i,
  /^Figure\s+\d+\.\d*\s+computers/i,
  /^Figure\s+\d+\.\d*\s+incorrect/i,
  /^Figure\s+\d+\.\d*\s+try/i,
  /^Figure\s+\d+\.\d*\s+again/i,
  /^Figure\s+\d+\.\d*\s+labeled/i,
  /^Figure\s+\d+\.\d*\s+targets/i,
  /^Figure\s+\d+\.\d*\s+incorrectly/i,
  /^Figure\s+\d+\.\d*\s+labeled/i,
  /^Figure\s+\d+\.\d*\s+target/i,
  /^Figure\s+\d+\.\d*\s+incorrectly/i,
  /^Figure\s+\d+\.\d*\s+notice/i,
  /^Figure\s+\d+\.\d*\s+organelle/i,
  /^Figure\s+\d+\.\d*\s+has/i,
  /^Figure\s+\d+\.\d*\s+smooth/i,
  /^Figure\s+\d+\.\d*\s+membrane/i,
  /^Figure\s+\d+\.\d*\s+involved/i,
  /^Figure\s+\d+\.\d*\s+building/i,
  /^Figure\s+\d+\.\d*\s+macromolecules/i,
  /^Figure\s+\d+\.\d*\s+not/i,
  /^Figure\s+\d+\.\d*\s+proteins/i,
  /^Figure\s+\d+\.\d*\s+wrong/i,
  /^Figure\s+\d+\.\d*\s+answer/i,
  /^Figure\s+\d+\.\d*\s+feedback/i,
  /^Figure\s+\d+\.\d*\s+using/i,
  /^Figure\s+\d+\.\d*\s+data/i,
  /^Figure\s+\d+\.\d*\s+gathered/i,
  /^Figure\s+\d+\.\d*\s+all/i,
  /^Figure\s+\d+\.\d*\s+students/i,
  /^Figure\s+\d+\.\d*\s+using/i,
  /^Figure\s+\d+\.\d*\s+program/i,
  /^Figure\s+\d+\.\d*\s+mastering/i,
  /^Figure\s+\d+\.\d*\s+biology/i,
  /^Figure\s+\d+\.\d*\s+offers/i,
  /^Figure\s+\d+\.\d*\s+wrong/i,
  /^Figure\s+\d+\.\d*\s+answer/i,
  /^Figure\s+\d+\.\d*\s+feedback/i,
  /^Figure\s+\d+\.\d*\s+specific/i,
  /^Figure\s+\d+\.\d*\s+each/i,
  /^Figure\s+\d+\.\d*\s+student/i,
  /^Figure\s+\d+\.\d*\s+rather/i,
  /^Figure\s+\d+\.\d*\s+simply/i,
  /^Figure\s+\d+\.\d*\s+providing/i,
  /^Figure\s+\d+\.\d*\s+feedback/i,
  /^Figure\s+\d+\.\d*\s+right/i,
  /^Figure\s+\d+\.\d*\s+wrong/i,
  /^Figure\s+\d+\.\d*\s+try/i,
  /^Figure\s+\d+\.\d*\s+again/i,
  /^Figure\s+\d+\.\d*\s+variety/i,
  /^Figure\s+\d+\.\d*\s+mastering/i,
  /^Figure\s+\d+\.\d*\s+biology/i,
  /^Figure\s+\d+\.\d*\s+guides/i,
  /^Figure\s+\d+\.\d*\s+students/i,
  /^Figure\s+\d+\.\d*\s+toward/i,
  /^Figure\s+\d+\.\d*\s+correct/i,
  /^Figure\s+\d+\.\d*\s+final/i,
  /^Figure\s+\d+\.\d*\s+answer/i,
  /^Figure\s+\d+\.\d*\s+without/i,
  /^Figure\s+\d+\.\d*\s+giving/i,
  /^Figure\s+\d+\.\d*\s+answer/i,
  /^Figure\s+\d+\.\d*\s+innovation/i,
  /^Figure\s+\d+\.\d*\s+assessment/i,
  /^Figure\s+\d+\.\d*\s+dynamic/i,
  /^Figure\s+\d+\.\d*\s+study/i,
  /^Figure\s+\d+\.\d*\s+modules/i,
  /^Figure\s+\d+\.\d*\s+use/i,
  /^Figure\s+\d+\.\d*\s+latest/i,
  /^Figure\s+\d+\.\d*\s+developments/i,
  /^Figure\s+\d+\.\d*\s+cognitive/i,
  /^Figure\s+\d+\.\d*\s+science/i,
  /^Figure\s+\d+\.\d*\s+help/i,
  /^Figure\s+\d+\.\d*\s+students/i,
  /^Figure\s+\d+\.\d*\s+study/i,
  /^Figure\s+\d+\.\d*\s+adapting/i,
  /^Figure\s+\d+\.\d*\s+performance/i,
  /^Figure\s+\d+\.\d*\s+real/i,
  /^Figure\s+\d+\.\d*\s+time/i,
  /^Figure\s+\d+\.\d*\s+students/i,
  /^Figure\s+\d+\.\d*\s+build/i,
  /^Figure\s+\d+\.\d*\s+confidence/i,
  /^Figure\s+\d+\.\d*\s+understanding/i,
  /^Figure\s+\d+\.\d*\s+enabling/i,
  /^Figure\s+\d+\.\d*\s+participate/i,
  /^Figure\s+\d+\.\d*\s+perform/i,
  /^Figure\s+\d+\.\d*\s+better/i,
  /^Figure\s+\d+\.\d*\s+both/i,
  /^Figure\s+\d+\.\d*\s+out/i,
  /^Figure\s+\d+\.\d*\s+class/i,
  /^Figure\s+\d+\.\d*\s+available/i,
  /^Figure\s+\d+\.\d*\s+smartphones/i,
  /^Figure\s+\d+\.\d*\s+tablets/i,
  /^Figure\s+\d+\.\d*\s+computers/i,
];

// Better model suggestions based on chapter content
function getBetterModelSuggestions(chapterTitle: string, content: string): any[] {
  const models: any[] = [];
  const lowerTitle = chapterTitle.toLowerCase();
  const lowerContent = content.toLowerCase();

  // DNA and Genetics
  if (lowerTitle.includes("dna") || lowerTitle.includes("genetic") || lowerContent.includes("dna") || lowerContent.includes("gene")) {
    models.push({
      path: "/models/dna-double-helix.glb",
      title: "DNA Double Helix Structure",
      description: "3D model showing the double helix structure of DNA with base pairs"
    });
    models.push({
      path: "/models/chromosome-structure.glb",
      title: "Chromosome Structure",
      description: "3D model of chromosome showing DNA packaging and histone proteins"
    });
  }

  // Cell structures
  if (lowerTitle.includes("cell") || lowerContent.includes("organelle") || lowerContent.includes("mitochondria") || lowerContent.includes("nucleus")) {
    models.push({
      path: "/models/eukaryotic-cell.glb",
      title: "Eukaryotic Cell Structure",
      description: "3D model showing major organelles including nucleus, mitochondria, ER, and Golgi"
    });
    models.push({
      path: "/models/plant-cell.glb",
      title: "Plant Cell Structure",
      description: "3D model of plant cell with chloroplasts and cell wall"
    });
  }

  // Proteins
  if (lowerTitle.includes("protein") || lowerContent.includes("amino acid") || lowerContent.includes("polypeptide")) {
    models.push({
      path: "/models/protein-structure.glb",
      title: "Protein Structure",
      description: "3D model showing primary, secondary, tertiary, and quaternary protein structure"
    });
    models.push({
      path: "/models/enzyme-substrate.glb",
      title: "Enzyme-Substrate Complex",
      description: "3D model showing enzyme active site and substrate binding"
    });
  }

  // Membranes
  if (lowerTitle.includes("membrane") || lowerContent.includes("phospholipid") || lowerContent.includes("plasma membrane")) {
    models.push({
      path: "/models/plasma-membrane.glb",
      title: "Plasma Membrane Structure",
      description: "3D model showing phospholipid bilayer with embedded proteins"
    });
  }

  // Photosynthesis
  if (lowerTitle.includes("photosynthesis") || lowerContent.includes("chloroplast") || lowerContent.includes("light reaction")) {
    models.push({
      path: "/models/chloroplast.glb",
      title: "Chloroplast Structure",
      description: "3D model of chloroplast showing thylakoids and stroma"
    });
    models.push({
      path: "/models/photosystem.glb",
      title: "Photosystem Complex",
      description: "3D model of photosystem II showing light-harvesting complexes"
    });
  }

  // Cellular respiration
  if (lowerTitle.includes("respiration") || lowerContent.includes("mitochondria") || lowerContent.includes("atp synthase")) {
    models.push({
      path: "/models/mitochondrion.glb",
      title: "Mitochondrion Structure",
      description: "3D model showing cristae and matrix of mitochondria"
    });
    models.push({
      path: "/models/atp-synthase.glb",
      title: "ATP Synthase",
      description: "3D model of ATP synthase enzyme complex"
    });
  }

  // Meiosis and mitosis
  if (lowerTitle.includes("meiosis") || lowerTitle.includes("mitosis") || lowerContent.includes("cell division")) {
    models.push({
      path: "/models/cell-division.glb",
      title: "Cell Division Process",
      description: "3D animation showing stages of mitosis or meiosis"
    });
  }

  // Evolution
  if (lowerTitle.includes("evolution") || lowerContent.includes("natural selection") || lowerContent.includes("phylogeny")) {
    models.push({
      path: "/models/phylogenetic-tree.glb",
      title: "Phylogenetic Tree",
      description: "3D visualization of evolutionary relationships"
    });
  }

  // Molecules
  if (lowerTitle.includes("chemical") || lowerTitle.includes("molecule") || lowerContent.includes("molecular")) {
    models.push({
      path: "/models/water-molecule.glb",
      title: "Water Molecule Structure",
      description: "3D model showing polar structure of water molecule"
    });
    models.push({
      path: "/models/organic-molecules.glb",
      title: "Organic Molecules",
      description: "3D models of carbohydrates, lipids, proteins, and nucleic acids"
    });
  }

  return models;
}

function isChapterTitle(title: string): boolean {
  // Check if it's a valid chapter title
  return VALID_CHAPTER_PATTERNS.some(pattern => pattern.test(title));
}

function shouldExclude(title: string): boolean {
  // Check if this should be excluded
  return EXCLUDE_PATTERNS.some(pattern => pattern.test(title));
}

function extractChapterNumber(title: string): number | null {
  const match = title.match(/CHAPTER\s+(\d+)|Chapter\s+(\d+)/i);
  if (match) {
    return parseInt(match[1] || match[2], 10);
  }
  return null;
}

function cleanSectionTitle(title: string): string {
  // Remove question numbers and clean up
  let cleaned = title.trim();
  
  // Remove leading question numbers
  cleaned = cleaned.replace(/^\d+\.\s*/, "");
  
  // Remove "MAKE CONNECTIONS", "WHAT IF", etc.
  cleaned = cleaned.replace(/^(MAKE CONNECTIONS|WHAT IF|VISUAL SKILLS|SCIENTIFIC INQUIRY|EVOLUTION CONNECTION):\s*/i, "");
  
  return cleaned;
}

function isQuestionSection(section: Section): boolean {
  if (!section.title) return false;
  const title = section.title.toLowerCase();
  
  // Check if it's a question
  return /^\d+\.\s*(what|how|why|explain|describe|compare|contrast|make connections|what if)/i.test(section.title) ||
         /^figure\s+\d+\.\d*/i.test(section.title) ||
         /^table\s+\d+\.\d*/i.test(section.title);
}

function cleanSectionContent(content: string): string {
  if (!content) return "";
  
  // Remove excessive whitespace
  let cleaned = content.replace(/\s+/g, " ").trim();
  
  // Remove very short content that's likely noise
  if (cleaned.length < 50) {
    return "";
  }
  
  // Remove content that's just figure/table references
  if (/^(Figure|Table)\s+\d+\.\d*/i.test(cleaned.substring(0, 20))) {
    return "";
  }
  
  return cleaned;
}

async function main() {
  const inputPath = path.join(process.cwd(), "data", "chapters", "chapters.json");
  const outputPath = path.join(process.cwd(), "data", "chapters", "chapters-refined.json");
  const backupPath = path.join(process.cwd(), "data", "chapters", "chapters.json.backup");

  console.log("=".repeat(60));
  console.log("Chapter Data Refinement Tool");
  console.log("=".repeat(60));
  console.log(`Reading from: ${inputPath}\n`);

  try {
    // Read existing chapters
    const rawData = fs.readFileSync(inputPath, "utf-8");
    const rawChapters: RawChapter[] = JSON.parse(rawData);
    
    console.log(`Found ${rawChapters.length} raw entries\n`);

    // Create backup
    fs.writeFileSync(backupPath, rawData, "utf-8");
    console.log(`✅ Created backup: ${backupPath}\n`);

    // Filter and refine chapters
    const validChapters: Chapter[] = [];
    const seenTitles = new Set<string>();

    for (const rawChapter of rawChapters) {
      // Skip if it should be excluded
      if (shouldExclude(rawChapter.title)) {
        continue;
      }

      // Only keep actual chapters
      if (!isChapterTitle(rawChapter.title)) {
        continue;
      }

      // Skip duplicates
      const normalizedTitle = rawChapter.title.toLowerCase().trim();
      if (seenTitles.has(normalizedTitle)) {
        continue;
      }
      seenTitles.add(normalizedTitle);

      // Extract chapter number for ordering
      const chapterNum = extractChapterNumber(rawChapter.title);
      if (!chapterNum) {
        continue;
      }

      // Clean up title
      let cleanTitle = rawChapter.title.replace(/^CHAPTER\s+/i, "").trim();
      cleanTitle = cleanTitle.replace(/^\d+\s+/, "").trim();

      // Process sections
      const cleanSections: Section[] = [];
      if (rawChapter.sections) {
        for (const section of rawChapter.sections) {
          // Skip question sections
          if (isQuestionSection(section)) {
            continue;
          }

          // Clean section
          const cleanTitle = cleanSectionTitle(section.title || "Introduction");
          const cleanContent = cleanSectionContent(section.content || "");

          // Skip empty sections
          if (!cleanContent && cleanTitle === "Introduction") {
            continue;
          }

          // Get better model suggestions
          const fullContent = (section.content || "") + " " + (rawChapter.title || "");
          const models = getBetterModelSuggestions(rawChapter.title, fullContent);

          cleanSections.push({
            title: cleanTitle || "Introduction",
            content: cleanContent || undefined,
            models: models.length > 0 ? models : undefined,
          });
        }
      }

      // Create refined chapter
      const refinedChapter: Chapter = {
        slug: `chapter-${chapterNum}-${cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}`,
        title: `Chapter ${chapterNum}: ${cleanTitle}`,
        description: `Chapter ${chapterNum} of Campbell Biology: ${cleanTitle}`,
        order: chapterNum,
        sections: cleanSections.length > 0 ? cleanSections : undefined,
      };

      validChapters.push(refinedChapter);
    }

    // Sort by chapter number
    validChapters.sort((a, b) => a.order - b.order);

    console.log(`✅ Refined to ${validChapters.length} valid chapters\n`);

    // Display summary
    console.log("Chapter Summary:");
    console.log("-".repeat(60));
    validChapters.forEach((chapter) => {
      const sectionCount = chapter.sections?.length || 0;
      const modelCount = chapter.sections?.reduce((sum, s) => sum + (s.models?.length || 0), 0) || 0;
      console.log(`${chapter.order}. ${chapter.title} (${sectionCount} sections, ${modelCount} models)`);
    });
    console.log("-".repeat(60));
    console.log();

    // Save refined chapters
    fs.writeFileSync(outputPath, JSON.stringify(validChapters, null, 2), "utf-8");
    console.log(`✅ Saved refined chapters to: ${outputPath}\n`);

    // Also update the main file
    fs.writeFileSync(inputPath, JSON.stringify(validChapters, null, 2), "utf-8");
    console.log(`✅ Updated: ${inputPath}\n`);

    console.log("=".repeat(60));
    console.log("✅ Refinement Complete!");
    console.log("=".repeat(60));
    console.log("\nNext steps:");
    console.log("1. Review the refined chapters");
    console.log("2. Further edit chapter content as needed");
    console.log("3. Create or source 3D models based on suggestions");
    console.log("4. Update model paths when models are ready");
  } catch (error) {
    console.error("\n❌ Error during refinement:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Stack:", error.stack);
    }
    process.exit(1);
  }
}

main();

