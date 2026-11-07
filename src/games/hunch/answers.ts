/** Hand-curated answer pool for Hunch: common, friendly, five letters, no plain plurals. */
const RAW = `
about above actor adapt adult after again agent agree ahead alarm album alert alive allow alone along alter amber ample angel anger angle angry ankle apple apply  apron arena argue arise armor aroma array arrow aside asset atlas attic audio avoid awake award aware awful
bacon badge baker basic basil basin batch beach beard beast begin being bench berry bible  birth black blade blame blank blast blaze bleak blend bless blind blink bliss block bloom blown  bluff blunt blush board boast bonus boost booth bound brain brake brand brave bread break breed brick bride brief bring brisk broad broke brook broom brown brush buddy build built bunch burst buyer
cabin cable cache candy canoe carol carry carve catch cause cedar chain chair chalk champ charm chart chase cheap check cheek cheer chess chest chief child chill chime chunk cider civic claim clash class clean clear clerk click cliff climb cling clock close cloth cloud clown coach coast cocoa color comet comic coral couch cough could count court cover crack craft crane crash crawl crazy cream creek creep crisp cross crowd crown crumb crush crust curve cycle
daily dairy daisy dance dated dealt decay delay delta dense depth diary dirty ditch diver dizzy dodge doing donor doubt dough draft drain drama drank drape drawn dream dress dried drift drill drink drive drown dryer duvet dwarf
eager eagle early earth easel eight elbow elder elect elite email ember empty enjoy enter entry equal error essay event every exact exist extra
fable faint fairy faith false fancy fault feast fence ferry fever fiber field fiery fifth fifty fight final first flame flash fleet flesh float flock flood floor flour fluid flute focus foggy force forge forth forty forum found frame fresh fried front frost fruit fudge funny
giant gator ghost giddy given glass gleam glide globe gloom glory gloss glove glued goose grace grade grain grand grant grape graph grasp grass grate great green greet grief grill grind groan groom group grove growl grown guard guess guest guide guilt gummy
habit happy harsh haste hatch haunt heart heavy hedge hello hence  hinge hobby holly honey honor horse hotel hound house human humor hurry hyena
icing ideal image imply index inner input irony ivory
jazzy jelly jewel joint jolly judge juice juicy jumbo jumpy
karma kayak kebab khaki kiosk kitty knack knead kneel knife  knock known koala
label lance large laser later laugh layer leafy learn lease least leave ledge legal lemon level lever light lilac limit linen liner lived liver llama lobby local lodge logic loose lotus lover lower loyal lucky lunar lunch lyric
magic major maker mango maple march marsh mason match mayor meant medal media melon mercy merge merit merry metal meter midst might mimic minor minty mirth mixed model moist money month moose moral motor motto mount mouse mouth movie muddy mural music
naive nanny nasty naval nerve never newly niche night noble noise north notch noted novel nurse nutty nylon
oasis occur ocean olive onion opera orbit order organ other otter ought ounce outer owner oxide
paint pansy panel panic paper party pasta paste patch pause peace peach pearl pedal penny perch peril phase phone photo piano piece pilot pinch pixel pizza place plain plane plant plate plaza plead pluck plumb plume plump plush  point polar polka porch pouch pound power prank prawn press price pride prime print prize probe proof proud prove prune pulse punch pupil puppy purse
quack queen query quest queue quick quiet quilt quirk quite quote
rabbi radar radio raise rally ranch range rapid raven reach react ready realm rebel refer reign relax relay renew reply rider ridge rifle right rigid rinse risky rival river roast robin robot rocky rodeo rouge rough round route royal rugby ruler rural
sadly safer saint salad salsa sandy sauce scale scarf scene scent scoop scout scrap screw seize sense serve seven shade shake shall shape share shark sharp shave sheep sheet shelf shell shift shine shiny shirt shock shore short shout shown shrug sight silly since sixth sixty skate skill skirt skull slate sleep slice slide slope small smart smell smile smoke snack snail snake sneak sniff snowy solar solid solve sorry sound south space spare spark speak speed spell spend spice spicy spike spine spoon sport spray squad stack staff stage stain stair stake stale stamp stand stare stark start state steak steam steel steep steer stern stick stiff still sting stock stone stood stool store storm story stove strap straw stray strip stuck study stuff stump style sugar suite sunny super swamp  swear sweat sweep sweet swept swift swing sword
table taboo tacit taffy taken tango taste teach tease teddy teeth tempo tenor tense tenth thank theme thick thing think third thorn those three threw throw thumb tidal tiger tight timer tired title toast today token tonic tooth topic torch total touch tough towel tower toxic trace track trade trail train trait trash treat trend trial tribe trick tried troop trout truck truly trump trunk trust truth tulip  tummy tuner tutor twice twist
ultra uncle under unify union unite unity until upper upset urban usage usual utter
vague valid value vapor vault venue verse video vigor vinyl viola viral virus visit vista vital vivid vocal voice voter
wagon waist waltz waste watch water weary weave wedge weigh weird whale wheat wheel where which while whirl white whole whose widen widow width wield windy  witch witty woman world worry worth would wound wrist write wrong
yacht yearn yeast yield young youth
zebra zesty
`;

export const ANSWERS: readonly string[] = Array.from(
  new Set(RAW.split(/\s+/).filter(Boolean).map((w) => w.toUpperCase())),
);
