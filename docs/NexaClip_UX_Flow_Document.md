NexaClip  ·  UX Flow Document  ·  MVP Phase 1 

1 

# **NexaClip** AI Creator Intelligence Platform 

### **User Experience Flow Document** 

MVP Phase 1 · End-to-End Interaction Design _Version 1.0  ·  March 2026  ·  For Solution Architect + UI/UX Designer_ 

###### **Purpose & Audience** 

This document defines the complete end-to-end user experience for all six MVP features of NexaClip. It covers: user journey maps, step-by-step interaction flows with system responses, screen inventories, component patterns, empty/loading/error states, and UX design principles. 

PRIMARY AUDIENCE: Senior Solution Architect (backend behaviour, API contracts, system states) Senior UI/UX Designer (screen designs, component library, interaction patterns) 

HOW TO USE: Start with Section 2 (UX Principles) to align on the design philosophy. Then use each feature section as a brief for designing that feature's screens. The flow tables define the contract between frontend, backend, and AI layers. 

_Confidential — For NexaClip Design & Architecture Team  ·  March 2026_ 

NexaClip  ·  UX Flow Document  ·  MVP Phase 1 

2 

## **1. Information Architecture** 

The NexaClip app has a flat, tab-based navigation structure with five primary destinations. Every feature in the MVP is reachable within two taps from any screen. This reduces cognitive load and ensures users always know where they are. 

##### **1.1  Navigation Structure** 

|**Tab**|**Primary Content**|**Key Actions**|**MVP Features**|
|---|---|---|---|
|Home (Feed)|Chronological content feed<br>from followed creators and<br>trending|Like, comment, follow,<br>share, browse|F3 — Social Feed|
|Create|AI Studio — image/meme<br>generation and clip<br>trimming|Generate images, trim<br>clips, publish, adapt for<br>platforms|F1 — Image Studio, F6 —<br>Clip Trimmer|
|Battles|Daily prompt challenge and<br>community leaderboard|Enter battle, vote, view<br>leaderboard, earn badges|Phase 2 — not MVP|
|Analytics|Performance dashboard<br>and Claude weekly report|View metrics, read Claude<br>report, access Coach|F5 — Analytics Report|
|Profile|User profile, settings,<br>subscription management|Edit profile, manage plan,<br>view own content grid|F3 — User Accounts|



##### **1.2  App Entry Points** 

|**Entry Point**|**Route**|**User Context**|
|---|---|---|
|Fresh install / signup|→ Signup Screen → Claude<br>Onboarding Chat → Home Feed|New user, no context, high guidance<br>needed|
|Returning user (has<br>account)|→ Login Screen → Home Feed (last<br>viewed)|Known user, quick access expected|
|Returning user<br>(biometric/remembered)|→ Home Feed directly (skip login)|Power user, zero friction required|
|Deep link from shared<br>content|→ Single Post View → Follow prompt<br>→ Sign up if no account|Referred user, social proof moment|
|Push notification (trend<br>brief)|→ Trend Brief card in Analytics tab|Pro user, ready to create content|
|Push notification (battle<br>result)|→ Battle Results screen|Engaged user, reward moment|
|Email (weekly report)|→ Analytics tab → Report card<br>highlighted|Pro user, analytical context|



##### **1.3  Global Navigation Rules** 

- Back navigation is always available — no dead ends. Every screen has a clear exit. 

_Confidential — For NexaClip Design & Architecture Team  ·  March 2026_ 

NexaClip  ·  UX Flow Document  ·  MVP Phase 1 

3 

- The Create tab is always one tap away — the primary value action must never be buried. 

- The bottom navigation bar is persistent across all main screens. It disappears only in full-screen content views (video playback) and reappears on scroll-up. 

- Modals and sheets slide in from the bottom on mobile. They never replace the current screen — users always return to where they were. 

- All destructive actions (delete post, cancel upload) require a confirmation step. 

##### **1.4  Screen Inventory — Complete MVP** 

|**#**|**Screen Name**|**Feature**|**Screen**<br>**Type**|**Notes**|
|---|---|---|---|---|
|S01|Splash / App Load|Global|Splash|Logo animation, auth check|
|S02|Welcome / Value Prop|Auth|Onboarding<br>slide|3 slides showing core value|
|S03|Sign Up|Auth|Form screen|Email, username, password,<br>CTA|
|S04|Log In|Auth|Form screen|Email + password, biometric<br>option|
|S05|Claude Onboarding Chat|F2|Conversation<br>UI|5-question chat flow|
|S06|Onboarding Complete|F2|Confirmation|Shows 7-day plan preview|
|S07|Home Feed|F3|Feed / list|Infinite scroll, content cards|
|S08|Single Post View|F3|Detail screen|Full post, comments, share|
|S09|User Profile|F3|Profile<br>screen|Grid + stats + follow button|
|S10|Edit Profile|F3|Form screen|Avatar, bio, game niche tags|
|S11|Create Tab Hub|F1/F6|Dashboard|Two paths: Generate Image or<br>Upload Clip|
|S12|Image Studio — Prompt<br>Input|F1|Input screen|Prompt field, style picker,<br>generate CTA|
|S13|Image Studio — Result|F1|Result<br>screen|Generated image, caption,<br>hashtags, actions|
|S14|Image Studio — Edit<br>Caption|F1|Edit sheet|Caption + hashtag editor<br>before publish|
|S15|Clip Upload — Select File|F6|Upload<br>screen|File picker, upload progress|
|S16|Clip Editor — Timeline|F6|Editor screen|Timeline scrubber, trim<br>handles, preview|
|S17|Clip Editor — AI Polish|F6|Processing<br>screen|Whisper captions loading,<br>effects picker, music|



_Confidential — For NexaClip Design & Architecture Team  ·  March 2026_ 

NexaClip  ·  UX Flow Document  ·  MVP Phase 1 

4 

|**#**|**Screen Name**|**Feature**|**Screen**<br>**Type**|**Notes**|
|---|---|---|---|---|
|S18|Clip Editor — Preview &<br>Publish|F6|Preview<br>screen|Final preview, publish settings,<br>share|
|S19|Analytics Dashboard|F5|Dashboard|Charts, stats, free vs pro<br>comparison|
|S20|Analytics Report (Pro)|F5|Report card|Claude-written weekly<br>narrative|
|S21|Upgrade / Paywall|Billing|Conversion<br>screen|Free vs Pro vs Studio<br>comparison|
|S22|Subscription Confirm|Billing|Confirmation|Success, plan active, feature<br>unlock|
|S23|Settings|Global|List screen|Account, notifications, privacy,<br>plan|
|S24|Notification Centre|Global|List screen|All push and in-app<br>notifications|
|S25|Content Rejected|F4|Error state|Moderation rejection with clear<br>reason|



_Confidential — For NexaClip Design & Architecture Team  ·  March 2026_ 

NexaClip  ·  UX Flow Document  ·  MVP Phase 1 

5 

## **2. UX Princi les & Desi n Philoso h** **<u>p g p y</u>** 

These six principles govern every design decision in the NexaClip MVP. They are listed in priority order — when two principles conflict, the higher-ranked one takes precedence. 

|**Priority**|**Principle**|**What It Means**|**How It Shows Up in the UI**|
|---|---|---|---|
|1|Speed to first value|A new user must experience<br>something genuinely useful within<br>90 seconds of opening the app.|Onboarding chat takes under 2<br>minutes. Image generation<br>delivers a result in under 8<br>seconds. No mandatory tutorial<br>before the first action.|
|2|AI feels like magic,<br>not machinery|Users should experience AI results<br>without seeing API calls, loading<br>spinners for >3 seconds, or<br>technical error messages.|Streaming responses in Claude<br>chat. Skeleton screens during<br>generation. Human-readable<br>error messages. Never show<br>"API error 429".|
|3|One clear next action|Every screen has one primary<br>action that is visually dominant.<br>Secondary actions are present but<br>not competing.|One prominent CTA button per<br>screen. Secondary actions in<br>context menus or bottom<br>sheets. No screen with two<br>equal-weight buttons.|
|4|Progressive<br>disclosure|Show only what the user needs<br>right now. Reveal complexity as<br>they signal readiness for it.|Free users see simple views.<br>Pro features shown as locked<br>previews to create desire.<br>Advanced settings behind a tap,<br>not upfront.|
|5|Celebrate creation|Every time a user publishes<br>something, it should feel like an<br>achievement.|Confetti micro-animation on first<br>publish. Sound design on<br>publish (optional). "Your clip is<br>live!" confirmation card with<br>share options prominent.|
|6|Respect the upgrade<br>moment|Paid upgrade prompts must feel<br>helpful, not predatory. Users<br>should feel like they are unlocking<br>power, not hitting a wall.|Paywall screens show value<br>already received before asking<br>for payment. Upgrade CTAs say<br>"Unlock X" not "You need Pro<br>for this". No dark patterns.|



##### **2.1  Visual Language Guidelines (for UI/UX Designer)** 

|**Element**|**Guidance**|
|---|---|
|Primary color|Deep purple (#5B3DB5) — used for primary CTAs, active navigation, AI-<br>generated content badges|
|Secondary color|Teal (#0A7560) — used for system success states, Claude AI responses,<br>published content indicators|
|Background|Near-white (#F8F7FF) with a very subtle purple tint — feels premium, not clinical|
|Content cards|White (#FFFFFF) with 1px border (#E0E0E0), 12px border radius, subtle<br>elevation (shadow: 0 2px 8px rgba(0,0,0,0.06))|



_Confidential — For NexaClip Design & Architecture Team  ·  March 2026_ 

NexaClip  ·  UX Flow Document  ·  MVP Phase 1 

6 

|**Element**|**Guidance**|
|---|---|
|Typography —<br>Display|Bold, 28–32px — used for screen titles, result headlines, onboarding headers|
|Typography — Body|Regular, 15–16px — used for all instructional text, descriptions, feed content|
|Typography — Label|Medium, 12–13px — used for tags, badges, timestamp, metadata|
|Spacing system|8px base unit. Content padding: 16px. Card internal padding: 16px. Section gaps:<br>24px.|
|Border radius|8px for cards and inputs. 24px for pills and badges. 50% for avatars.|
|Animation duration|Micro-interactions: 150ms ease-out. Screen transitions: 300ms ease-in-out.<br>Loading skeletons: 1.5s pulse.|
|AI content marker|Purple gradient badge "AI Generated" on all machine-created content —<br>transparency builds trust|
|Watermark style|Semi-transparent NexaClip wordmark at bottom-right of free-tier AI content —<br>tasteful, not ugly|



##### **2.2  Interaction Patterns (for Solution Architect)** 

|**Pattern**|**Technical Implementation Notes**|
|---|---|
|Optimistic UI updates|When a user likes a post, update the counter immediately in the UI. Confirm<br>with the server in background. Revert only if the server returns an error. Never<br>make the user wait for likes/follows.|
|Skeleton loading<br>screens|All content that loads asynchronously (feed, analytics, AI results) must show<br>skeleton placeholders that match the content shape. No blank white screens or<br>generic spinners.|
|Streaming Claude<br>responses|Creator Coach chat responses stream token-by-token using Server-Sent<br>Events (SSE). The Angular component renders each token as it arrives —<br>users see text appearing naturally rather than a loading spinner followed by a<br>wall of text.|
|Pull to refresh|Feed and Analytics screens support pull-to-refresh. Minimum 500ms before<br>showing "Up to date" even if the network responds faster — removes the<br>jarring instant snap.|
|Infinite scroll|Feed loads 20 items. When user scrolls within 5 items of the end, the next 20<br>are fetched. A subtle loading indicator at the bottom (not a full-page spinner).|
|Upload progress|File upload to S3 shows a real progress bar (using the S3 pre-signed URL XHR<br>upload progress event). Not a fake animation — real bytes transferred.|
|Error recovery|Every error state includes a single, specific action the user can take to recover.<br>Never show an error with only a "Close" button. Errors include: Retry, Try<br>Different Prompt, or Contact Support.|
|Empty states|Every list that can be empty (feed with no follows, analytics with no posts) has<br>a designed empty state with an illustration, one-line explanation, and a CTA to<br>the relevant create action.|



_Confidential — For NexaClip Design & Architecture Team  ·  March 2026_ 

NexaClip  ·  UX Flow Document  ·  MVP Phase 1 

7 

#### **Feature F2 — Claude Onboarding Chat** 

_First impression · Sets up personalisation · One-time only_ 

The onboarding flow is the most critical UX in the entire product. A user who completes onboarding and receives a personalised first-week plan is 3× more likely to return on Day 7. Every interaction in this flow must feel warm, fast, and genuinely intelligent — not like filling in a form. 

##### **3.1  Journey Map — New User Onboarding** 

|**AWARENESS**<br>**(Pre-install)**|**User Steps**|**Emotional**<br>**State**|**Design Cue**|
|---|---|---|---|
||User sees NexaClip on App Store or shared post|Curious|Strong value<br>prop in store<br>listing|
||Reads description: "Your AI gaming content<br>coach"|Skeptical|Social proof: X<br>creators use<br>NexaClip|
||Taps Install / Sign Up|Ready to try|Frictionless<br>install CTA|
|**WELCOME**<br>**(S02)**|**User Steps**|**Emotional**<br>**State**|**Design Cue**|
||App opens — splash screen fades in with logo|First impression|Logo animation:<br>subtle upward<br>float, 600ms|
||Welcome screen: 3 swipeable slides|Intrigue|Auto-advance<br>after 4s or<br>manual swipe|
||Slide 1: "Create clips that go viral" + sample|Building desire|Progress dots<br>visible|
||Slide 2: "Your personal AI coach, 24/7"|Trust signal|Only 3 slides —<br>no fatigue|
||Slide 3: "Join 10,000+ gaming creators" (beta:<br>"First 100 creators")|Social proof|Real screenshot<br>of the product|
||CTA: Get Started / Already have account?|Decision point|Two CTAs of<br>equal weight<br>here|
|**SIGN UP (S03)**|**User Steps**|**Emotional**<br>**State**|**Design Cue**|
||Minimal form: email, username, password|Slight friction —<br>tolerated|Maximum 3<br>fields visible|



_Confidential — For NexaClip Design & Architecture Team  ·  March 2026_ 

NexaClip  ·  UX Flow Document  ·  MVP Phase 1 

8 

|**SIGN UP (S03)**|**User Steps**|**Emotional**<br>**State**|**Design Cue**|
|---|---|---|---|
||No phone number, no date of birth|Relieved (simple<br>form)|OAuth buttons<br>are equal size to<br>email option|
||Accepts Google / Apple sign-in option|Confident|Password<br>strength indicator<br>(visual bar)|
||Tap "Create Account"|Anxious (will this<br>work?)|"Verify later"<br>allowed — do not<br>block<br>progression|
||Email verification sent (but user can proceed)|Neutral — will<br>verify later|Loading state on<br>button: spinner<br>replaces text|



|**ONBOARDING**<br>**CHAT (S05)**|**User Steps**|**Emotional**<br>**State**|**Design Cue**|
|---|---|---|---|
||Claude: "Welcome! I'm your NexaClip Coach.<br>Let me set you up in 90 seconds."|Excited — feels<br>personal|Conversational<br>bubble UI (not<br>form)|
||Q1: "What games do you play most? (pick up to<br>3)"|Engaged|Pre-built chip<br>options — no<br>typing required|
||User taps game chips or types|Easy — tap<br>selection|Chips animate in<br>after each Q|
||Q2: "Who do you create content for?"|Curious|Three options<br>max per question|
||User selects audience type|Easy — options<br>visible|Icon + label on<br>each option|
||Q3: "What's your main goal — grow fast or build<br>community?"|Thinking|Show only one<br>question at a<br>time|
||User selects goal|Taps answer|Smooth scroll to<br>new question|
||Q4: "How often can you realistically post?"|Honest moment|Slider or 3 option<br>chips|
||User selects frequency|Selects|Friendly options<br>(1–2x, 3–5x,<br>daily)|
||Q5: "Do you have existing clips or starting<br>fresh?"|Honest|Two options with<br>icons|
||User selects|Selects|Radio-style<br>selection|
||Claude: "Building your personalised plan..."|Anticipation|Claude typing<br>indicator (3 dots)|



_Confidential — For NexaClip Design & Architecture Team  ·  March 2026_ 

NexaClip  ·  UX Flow Document  ·  MVP Phase 1 

9 

|**ONBOARDING**<br>**CHAT (S05)**|**User Steps**||**Emotional**<br>**State**|**Design Cue**|
|---|---|---|---|---|
||Claude: delivers 7-day plan||Satisfaction|Plan appears<br>with card<br>animation|
|**PLAN**<br>**REVEAL (S06)**|**User Steps**||**Emotional**<br>**State**|**Design Cue**|
||Screen: "Your first week is ready"||Delight|Celebration<br>animation<br>(confetti or<br>sparkle)|
||Shows 7 cards in a horizontal scroll (|Mon–Sun)|Genuine surprise|Card reveal<br>staggered: each<br>card slides in<br>with 80ms delay|
||Each card: day, content type icon, th|eme, tip|Curiosity —<br>reading each<br>card|Cards are<br>tappable — tap<br>goes to Create<br>tab with that day<br>pre-filled|
||CTA: "Let's start with Monday's cont|ent →"|Motivated|Primary CTA<br>drives directly<br>into creation flow|
|**3.2  Detailed**|Secondary: "Explore the app first"<br>**Interaction Flow — Onboa**|**rding Ch**|Ready to create<br>**at (S05)**|Skip option never<br>hidden —<br>respect user<br>autonomy|
|**#**<br>**Actor**|**Action / User Input**|**System Re**|**sponse**|**Screen State**|
|**1**<br>**System**|Account created. Redirect to<br>Onboarding Chat screen.|Load onbo<br>Claude onb<br>prompt fro<br>conversatio|arding chat UI. Fetch<br>oarding system<br>m config. Initialise<br>n state.|Chat screen —<br>empty, loading|
|**2**<br>**System**|Claude sends first message.|POST to /c<br>Claude API<br>system pro<br>streams int|oach/onboarding —<br>call with onboarding<br>mpt. Response<br>o chat bubble.|Claude bubble<br>appears with<br>typing indicator,<br>then text<br>streams in|
|**3**<br>**User**|Reads: "Welcome! I'm your<br>NexaClip coach. What games<br>do you play?" — sees 6 game<br>chip options appear below the<br>message.|Game chip<br>interactive<br>Valorant, F<br>Legends, F|s rendered as<br>pill buttons. Options:<br>ortnite, CS2, Apex<br>IFA, Other.|Chips animate in<br>with stagger,<br>50ms each|
|**4**<br>**User**|Taps 1–3 game chips (multi-<br>select). Taps "Done →" button.|Selected c<br>purple. Uns|hips highlight in<br>elected fade slightly.|Selected state<br>on chips. Done<br>CTA appears.|



_Confidential — For NexaClip Design & Architecture Team  ·  March 2026_ 

NexaClip  ·  UX Flow Document  ·  MVP Phase 1 

10 

|**#**|**Actor**|**Action / User Input**|**System Response**|**Screen State**|
|---|---|---|---|---|
||||"Done" button appears after first<br>selection.||
|**5**|**System**|User selection sent as a<br>message bubble.|User's answer appears as a<br>right-aligned chat bubble.<br>Claude begins typing indicator<br>immediately.|User bubble<br>right-aligned.<br>Claude typing<br>dots visible.|
|**6**|**Claude**|Q2 appears: "Who's your<br>audience?" with 3 option chips.|Next Claude message<br>streamed. Three new chips<br>render below: Competitive<br>players, Casual fans, General<br>gaming.|New question +<br>chips animate<br>into view. Scroll<br>follows.|
|**7**|**User**|Taps one audience option.|Single-select — only one chip<br>highlights. User's answer bubble<br>appears immediately without<br>tapping Done.|Answer auto-<br>submitted on<br>single-select<br>options|
|**8**|**Claude**|Q3: "What's your main goal?"|Three option chips: Grow<br>followers fast, Build a loyal<br>community, Attract brand deals.|Same pattern.<br>Auto-submit on<br>selection.|
|**9**|**Claude**|Q4: "How often can you<br>realistically post?"|Three options with icons: 1–2×<br>per week, 3–5× per week, Daily.|Icons on chips<br>add visual<br>weight|
|**10**|**Claude**|Q5: "Do you have existing clips<br>or are you starting from<br>scratch?"|Two options: I have clips ready,<br>Starting fresh.|Two large option<br>blocks (full<br>width)|
|**11**|**System**|All 5 answers collected.|Send full conversation to Claude<br>API — structured output mode.<br>Request 7-day content plan<br>JSON.|Screen shows<br>"Building your<br>plan..." with<br>animated pulse<br>on Claude<br>avatar|
|**12**|**Claude**|Delivers message: "Your plan is<br>ready!" with plan preview.|Plan JSON received. Store in<br>users.onboarding_plan. Render<br>plan preview: first 3 days visible<br>as cards.|Plan cards<br>animate into<br>view —<br>staggered 80ms<br>per card|
|**13**|**User**|Taps "See full plan →" or "Let's<br>start with today →"|Navigate to onboarding<br>complete screen (S06). Mark<br>onboarding_completed = true in<br>DB.|Transition to<br>plan reveal<br>screen|



##### **3.3  Onboarding Error States & Edge Cases** 

|**Network lost mid-chat**|**Claude API timeout**<br>**(>8s)**|**User exits mid-**<br>**onboarding**|**User skips onboarding**|
|---|---|---|---|
|Show banner: "You're<br>offline — your progress is<br>saved. Reconnect to<br>continue." Persist<br>answers in local storage.|Show: "Taking a moment<br>longer than usual..." After<br>15s: "Hmm, something<br>slowed us down. Your<br>answers are saved — tap|On next app open,<br>prompt: "You were<br>setting up your profile —<br>want to finish? (2<br>questions left)" Resume|Allow skip with "Set up<br>later" link. Dashboard<br>shows "Complete setup<br>for a personalised plan"<br>persistent banner. Never|
|Resume from last<br>question on reconnect.|Retry to get your plan."|from last completed<br>question.|ask more than once per<br>session.|



_Confidential — For NexaClip Design & Architecture Team  ·  March 2026_ 

NexaClip  ·  UX Flow Document  ·  MVP Phase 1 

11 

**Network lost mid-chat** 

**Claude API timeout User exits midUser skips onboarding (>8s) onboarding** 

Offer retry without reanswering questions. 

###### **UX Design Notes — Onboarding for the Designer** 

Typography: Claude's messages use a slightly different font weight (Regular) vs user messages (Medium) 

to reinforce the conversational dynamic without using different colors. 

Timing: Never render all questions at once even if they load fast. Introduce a 400ms artificial delay between Q5 answer and plan reveal — the anticipation makes the plan feel more earned. 

Accessibility: All chip options must work with screen readers. Each chip has aria-label including 

the game name. The "Done" button appears after the first selection — not on page load. 

Progress indicator: A subtle progress bar at the top of the chat showing "Question 3 of 5" reduces anxiety about how long this will take. 

Avatar: Claude has a distinct avatar — the NexaClip purple logo mark — not a generic AI robot. This reinforces brand identity during the first impression. 

_Confidential — For NexaClip Design & Architecture Team  ·  March 2026_ 

NexaClip  ·  UX Flow Document  ·  MVP Phase 1 

12 

#### **Feature F1 — Image & Meme AI Studio** 

_Core creation tool · Daily driver · Upgrade trigger_ 

The Image Studio is the most-used feature for free users and the most powerful upgrade demonstration. The UX must make the creation feel effortless — type a thought, get a shareable image. The watermark and daily limit must be visible enough to motivate upgrade but not so intrusive that the product feels broken. 

##### **4.1  Create Tab Hub (S11)** 

###### **SCREEN  S11 — Create Tab Hub** 

To <mark>p</mark> : "What do <mark>y</mark> ou want to create toda <mark>y</mark> ?" <mark>(</mark> lar <mark>g</mark> e <mark>,</mark> friendl <mark>y</mark> headin <mark>g)</mark> 

Two <mark>p</mark> rimar <mark>y</mark> cards <mark>(</mark> full width <mark>,</mark> visual thumbnails <mark>)</mark> : 

Card A: "Ima <mark>g</mark> e or Meme" — icon: s <mark>p</mark> arkles — subtitle: "Generate from a <mark>p</mark> rom <mark>p</mark> t in 8 seconds" 

Card B: "Gamin <mark>g</mark> Cli <mark>p</mark> " — icon: video — subtitle: "U <mark>p</mark> load <mark>,</mark> trim <mark>,</mark> and AI- <mark>p</mark> olish <mark>y</mark> our best moments" Below: "Recent Creations" — horizontal scroll of last 6 items Bottom sheet tri <mark>gg</mark> er: "See all m <mark>y</mark> content →" 

Free tier: Small banner at to <mark>p</mark> : "You have 3 ima <mark>g</mark> e <mark>g</mark> enerations left toda <mark>y</mark> . ★ Go Pro for unlimited" 

##### **4.2  Detailed Interaction Flow — Image Generation** 

|**#**|**Actor**|**Action / User Input**|**System Response**|**Screen State**|
|---|---|---|---|---|
|**1**|**User**|Taps "Image or Meme" card on<br>Create Hub (S11).|Navigate to Image Studio<br>Prompt Input screen (S12).<br>Load user's last 3 prompts as<br>"Recent" chips.|S12 loads with<br>smooth slide-in<br>transition|
|**2**|**System**|S12 renders with prompt input<br>field focused automatically.|Auto-focus on prompt text field<br>(keyboard opens). Load style<br>picker carousel below field.<br>Check daily generation limit —<br>render counter badge if free<br>user.|Keyboard open,<br>cursor in prompt<br>field|
|**3**|**User**|Sees: Large text input area with<br>placeholder "Describe the<br>image you want... e.g. A<br>Valorant agent standing on a<br>Moroccan rooftop at golden<br>hour"|Placeholder text rotates every 4<br>seconds through 6 gaming-<br>specific examples.|Prompt field<br>active. Character<br>counter shows<br>0/500.|
|**4**|**User**|Types or speaks their prompt.<br>Optionally selects a style chip<br>below.|Style chips: Cinematic, Meme<br>Format, Pixel Art, Cartoon,<br>Realistic. Only one can be<br>active. Default: Cinematic.|Character count<br>updates. Selected<br>style chip<br>highlights in<br>purple.|



_Confidential — For NexaClip Design & Architecture Team  ·  March 2026_ 

NexaClip  ·  UX Flow Document  ·  MVP Phase 1 

13 

|**#**|**Actor**|**Action / User Input**|**System Response**|**Screen State**|
|---|---|---|---|---|
|**5**|**User**|Taps "Generate" button.|Validate: prompt not empty,<br>daily limit not exceeded, API<br>key available. If valid: disable<br>Generate button, show loading<br>state.|"Generate" button<br>becomes spinner.<br>Text: "Creating<br>your image..."|
|**6**|**System**|Request sent to DALL-E 3 via<br>backend. Estimated wait: 3–8<br>seconds.|POST to /content/generate.<br>Backend calls DALL-E 3. Result<br>stored in S3. CDN URL<br>returned. Simultaneously:<br>trigger caption + hashtag<br>generation (GPT-4o mini,<br>async).|Progress<br>animation plays.<br>Estimated time<br>shows if >4<br>seconds.|
|**7**|**System**|Image result arrives.|Navigate to Image Result<br>screen (S13) with image loaded<br>from CDN. Begin rendering<br>caption suggestions below<br>image.|S13 slides up.<br>Image fades in.<br>Caption area<br>shows skeleton<br>then text.|
|**8**|**System**|Caption and hashtag<br>suggestions load (0.5–2s after<br>image).|Three caption variations shown<br>as tappable option cards. Three<br>hashtag bundles shown as chip<br>groups: Short (3 tags), Medium<br>(8 tags), Long (15 tags).|Captions animate<br>in. User can<br>immediately tap to<br>select one.|
|**9**|**User**|Reviews image. Taps one<br>caption card to select it.|Selected caption highlights.<br>Caption text copies into editable<br>field below for customisation.|Caption selected<br>state. Edit field<br>becomes active.|
|**10**|**User**|Optionally edits caption text<br>directly.|Free-form text editing in the<br>caption field. Character counter<br>for platform limits (TikTok: 150,<br>Instagram: 2,200).|Editing state.<br>Platform limit<br>badge changes<br>color:<br>green/amber/red.|
|**11**|**User**|Selects hashtag bundle (Short /<br>Medium / Long).|Hashtags display as chips<br>below caption. User can<br>deselect individual hashtags<br>with a tap.|Hashtag chips<br>rendered.<br>Deselected chips<br>strike-through<br>lightly.|
|**12**|**User**|Taps "Publish to Feed" or<br>"Download".|If Publish: run content<br>moderation check (Claude API<br>— async, <3s). If Download:<br>generate watermarked version<br>(free) or clean version (Pro) and<br>trigger device download.|Publish: brief<br>"Checking<br>content..." overlay.<br>Download:<br>progress then<br>native share<br>sheet.|
|**13**|**System**|Content moderation check<br>completes.|If APPROVED: save content<br>record, add to user feed, show<br>success confirmation. If<br>REJECTED: navigate back to<br>S13 with rejection message<br>overlaid on image. If FLAG:<br>publish with human review<br>queue — user sees published<br>state.|Success:<br>confirmation card<br>slides up from<br>bottom.|
|**14**|**System**|Success state: "Your image is<br>live!🎉"|Confirmation card shows:<br>image thumbnail, "View on<br>Feed" button (primary), "Share|Celebration micro-<br>animation (sparkle|



_Confidential — For NexaClip Design & Architecture Team  ·  March 2026_ 

NexaClip  ·  UX Flow Document  ·  MVP Phase 1 

14 

**# Actor** 

|**Action / User Input**|**System Response**|**Screen State**|
|---|---|---|
||to TikTok" / "Copy Link"<br>buttons, "Create another"<br>button.|burst from image<br>thumbnail)|



##### **4.3  Error States — Image Studio** 

|**Daily limit reached**<br>**(Free)**|**DALL-E API slow /**<br>**timeout**|**Content rejected by**<br>**moderation**|**Poor quality result**|
|---|---|---|---|
|Limit badge turns red.<br>Generate button grayed.<br>Tapping shows upgrade<br>sheet (S21) with<br>message: "You've used<br>today's 5 free<br>generations. Unlock<br>unlimited with Pro — your<br>first image is ready in the<br>next 8 seconds."|After 12 seconds, show:<br>"Still working on your<br>image..." After 20<br>seconds: "This is taking<br>longer than usual. We'll<br>notify you when it's<br>ready." User can leave<br>the screen — system<br>completes in background<br>and sends push<br>notification.|Overlay on image: "This<br>content was flagged.<br>Reason: [plain English<br>reason from Claude].<br>Your prompt has been<br>saved — edit and<br>regenerate." Tapping the<br>image opens an edit<br>sheet with prompt pre-<br>filled.|"Not what you wanted?<br>Refine it." button always<br>visible below the<br>generated image.<br>Tapping opens a<br>refinement panel where<br>user can add description<br>of what to change without<br>retyping the full prompt.|



##### **4.4  Screen Layout Specifications (S12 — Prompt Input)** 

|**Zone**|**Specification**|
|---|---|
|Top bar|Back arrow (left) + "Image Studio" title (centre) + history icon (right —<br>opens last 10 prompts)|
|Prompt zone|Multiline text input, minimum 5 lines visible, max 500 characters.<br>Placeholder rotates. Auto-focus on load.|
|Style picker|Horizontal scroll of 5 chips below prompt. Icon + label. One always<br>selected (default: Cinematic).|
|Recent prompts|Collapsible section "Recent" showing last 3 prompts as tappable chips.<br>One tap pre-fills prompt field.|
|Generate CTA|Full-width button, purple, 56px height. "Generate Image" with sparkle icon.<br>Disabled state: 40% opacity when no prompt.|
|Free tier counter|Small banner above Generate button: "3 generations left today". Purple if<br>>2 remaining, amber if 1–2, red if 0.|
|Bottom safe area|16px safe area respected on all mobile targets.|



###### **Upgrade Moment Design — Critical UX Detail** 

When a free user hits their daily limit, the upgrade prompt must NOT feel like a punishment. The psychological framing matters enormously: 

WRONG: "You've reached your limit. Upgrade to continue." 

RIGHT:  "You've created 5 images today — you're on a roll. Unlock unlimited with Pro. 

_Confidential — For NexaClip Design & Architecture Team  ·  March 2026_ 

NexaClip  ·  UX Flow Document  ·  MVP Phase 1 

15 

**Upgrade Moment Design — Critical UX Detail** 

Your next image will be ready in 8 seconds." 

The upgrade sheet (S21) should show: an image the user just created (proof of value), then the Pro benefits (what they gain), then the price (last). 

Never lead with the price. Always lead with the value already demonstrated. 

The "Generate" button in disabled state should still be visible — it signals that the feature exists and is desirable. Do not hide it or replace it with an upgrade button. 

_Confidential — For NexaClip Design & Architecture Team  ·  March 2026_ 

NexaClip  ·  UX Flow Document  ·  MVP Phase 1 

16 

#### **Feature F6 — Assisted Clip Trimmer** 

_Upload → Trim → AI Polish → Publish · Core gaming content flow_ 

The Clip Trimmer is the most technically complex feature in the MVP from a UX perspective. Users upload potentially large files, wait for processing, and interact with a video timeline editor. The UX must manage the waiting time gracefully and make the AI polish step feel rewarding rather than automatic. 

##### **5.1  Clip Trimmer — Full Journey Map** 

|**UPLOAD (S15)**|**User Steps**|**Emotional**<br>**State**|**Design Cue**|
|---|---|---|---|
||User taps "Gaming Clip" from Create Hub (S11)|Ready to create|Two clear<br>options: camera<br>roll vs files app|
||Sees upload screen with drag-drop area and<br>"Choose File" button|Slight confusion<br>if first time|Large drop zone<br>with gaming<br>controller icon<br>and arrow|
||Selects video from device (camera roll or files)|Confident action|File size limit<br>stated upfront<br>(Free: 500MB,<br>Pro: 5GB)|
||File begins uploading — progress bar visible|Patience<br>required|Progress bar<br>shows exact %<br>and estimated<br>time remaining|
||Upload completes — file confirmed|Relief|Green check<br>animation on<br>completion|
|**TRIM (S16)**|**User Steps**|**Emotional**<br>**State**|**Design Cue**|
||Timeline editor appears with full video loaded|Focused —<br>wants the perfect<br>moment|Video loads as<br>thumbnail strip<br>across full width|
||User scrubs timeline to find highlight moment|In the zone —<br>reviewing their<br>gameplay|Smooth<br>scrubbing — no<br>lag, cached<br>frames|
||Drags left trim handle to set start point|Precise — small<br>adjustments<br>needed|Trim handles<br>have large hit<br>targets (48×48px<br>minimum)|
||Drags right trim handle to set end point|Same precision|Current clip<br>duration shown|



_Confidential — For NexaClip Design & Architecture Team  ·  March 2026_ 

NexaClip  ·  UX Flow Document  ·  MVP Phase 1 

17 

|**TRIM (S16)**|**User Steps**|**Emotional**<br>**State**|**Design Cue**|
|---|---|---|---|
||||in real time (e.g.<br>"0:23")|
||Taps "Preview" to watch the trimmed section|Evaluating<br>quality|Preview modal<br>plays clip in full<br>— no overlay UI|
||Adjusts if needed, confirms trim|Satisfied or<br>refining|"Looks good!"<br>and "Adjust" both<br>visible|
|**AI POLISH**<br>**(S17)**|**User Steps**|**Emotional**<br>**State**|**Design Cue**|
||User taps "AI Polish this clip"|Excited for the AI<br>magic|Single prominent<br>CTA — no<br>competing<br>options|
||Processing screen shows 3-step progress|Patient —<br>watching<br>progress|3-step progress<br>indicator with<br>animated icons,<br>not a spinner|
||Step 1: Transcribing audio (Whisper) — "Finding<br>your words..."|Curious|Friendly<br>language — not<br>technical terms|
||Step 2: Generating captions — "Adding<br>captions..."|Satisfied (it's<br>working)|Each step<br>checks off with a<br>small tick when<br>done|
||Step 3: Suggesting effects — "Detecting<br>highlights..."|Impressed|This step refers<br>to timing analysis<br>not YOLO<br>(YOLO is Phase<br>3)|
||AI polish complete — results shown|Delighted|Results reveal<br>with stagger<br>animation|
|**REVIEW &**<br>**PUBLISH**<br>**(S18)**|**User Steps**|**Emotional**<br>**State**|**Design Cue**|
||Preview screen shows clip with captions burned<br>in|Critical<br>evaluation|Captions overlay<br>on video in edit<br>mode — tap to<br>edit each line|
||User reviews caption text — can edit each line|Engaged —<br>making it<br>personal|Caption edit is<br>inline — no<br>separate screen|
||Picks background music from carousel|Creative choice|Music carousel:<br>10 tracks with|



_Confidential — For NexaClip Design & Architecture Team  ·  March 2026_ 

NexaClip  ·  UX Flow Document  ·  MVP Phase 1 

18 

|**REVIEW &**<br>**PUBLISH**<br>**(S18)**|**User Steps**|**Emotional**<br>**State**|**Design Cue**|
|---|---|---|---|
||||genre tags, 15s<br>preview on tap|
||Sets clip title and description|Ownership —<br>naming their<br>content|Title field: max<br>80 chars.<br>Description<br>optional.|
||Taps "Publish to Feed"|Commitment|Button: "Publish"<br>— not "Submit"<br>or "Post"|
||Moderation check runs (invisible to user if <3s)|Neutral wait|If moderation<br>>3s: "Checking<br>your clip..."<br>subtle overlay|
||Published confirmation screen|Pride and<br>excitement|Full celebration:<br>"Your clip is live!<br>View on Feed →"|



##### **5.2  Detailed Interaction Flow — Clip Upload & Trim** 

|**#**|**Actor**|**Action / User Input**|**System Response**|**Screen State**|
|---|---|---|---|---|
|**1**|**User**|Taps "Gaming Clip" from Create<br>Hub.|Navigate to S15. Request pre-<br>signed S3 upload URL from<br>Content Service<br>(/content/upload-url).|S15 loads.<br>Upload area<br>renders.|
|**2**|**User**|Taps "Choose from Camera<br>Roll". Device file picker opens.|Native file picker — no custom<br>handling needed.|Device native<br>picker overlay|
|**3**|**User**|Selects video file (e.g. 200MB<br>.mp4).|File object received. Check file<br>type (mp4/mov/avi accepted).<br>Check file size vs plan limits. If<br>valid, begin XHR upload to S3<br>using pre-signed URL.|Progress bar<br>appears. Shows:<br>filename, file<br>size, % and time<br>remaining.|
|**4**|**System**|File uploads to S3 (progress:<br>0→100%).|XHR progress events update UI<br>in real time. On completion, S3<br>Lambda triggers Content<br>Service. Content record created<br>with status: UPLOADED.|Progress bar<br>fills. "Upload<br>complete!✓"<br>brief<br>confirmation.|
|**5**|**System**|Video ready for trimming.<br>Navigate to S16.|Load video into Angular video<br>player. Extract frame thumbnails<br>every 2 seconds for the timeline<br>strip. These render<br>progressively as they generate.|S16 loads.<br>Timeline renders<br>frame by frame<br>(progressive).|
|**6**|**User**|Drags trim handles on timeline.|Video currentTime updates as<br>handle moves. Show current<br>trim duration in the HH:MM<br>format above handles. Minimum<br>clip length: 5 seconds.|Trim selection<br>highlight<br>between<br>handles.|



_Confidential — For NexaClip Design & Architecture Team  ·  March 2026_ 

NexaClip  ·  UX Flow Document  ·  MVP Phase 1 

19 

|**#**|**Actor**|**Action / User Input**|**System Response**|**Screen State**|
|---|---|---|---|---|
||||Maximum: Free 90s / Pro 180s /<br>Studio unlimited.||
|**7**|**User**|Taps "Preview Trim".|Play video from trim start to trim<br>end only. Full-screen preview<br>modal.|Full-screen<br>modal. Tap<br>anywhere to<br>dismiss.|
|**8**|**User**|Satisfied — taps "Apply Trim &<br>Continue".|Store trim start/end timestamps.<br>Navigate to S17. Dispatch<br>POST to /content/clip/polish with<br>trim metadata. Begin Whisper<br>transcription job.|S17 loads. Step<br>1 spinner active.|
|**9**|**System**|Whisper transcription completes<br>(30s–3min depending on clip<br>length).|Transcript returned with word-<br>level timestamps. Generate<br>WebVTT caption file. Progress:<br>Step 1✓, Step 2 activates.|Step 1 checks.<br>Step 2 spinner.|
|**10**|**System**|Caption file generated and<br>stored.|Caption file saved to S3. CDN<br>URL returned. Progress: Step 2<br>✓, Step 3 activates.|Step 2 checks.<br>Step 3 spinner.|
|**11**|**System**|Effects suggestions computed<br>and music matched.|Timing analysis (simple<br>algorithm — peak audio<br>moments for slow-mo<br>suggestion). Music library query<br>for genre match. Progress: Step<br>3✓.|All 3 steps<br>checked. "Polish<br>complete!" —<br>results animate<br>in.|
|**12**|**System**|Navigate to S17 results view.|Show: captions preview, effects<br>toggle (slow-mo on/off), music<br>selection carousel.|Results section<br>slides in from<br>below. Smooth<br>reveal.|



##### **5.3  Detailed Interaction Flow — Review & Publish (S18)** 

|**#**|**Actor**|**Action / User Input**|**System Response**|**Screen State**|
|---|---|---|---|---|
|**13**|**User**|Taps "Preview with captions"<br>button.|Play clip with captions overlaid.<br>Captions use the WebVTT file<br>generated in Step 9.|Full-screen<br>video preview<br>with captions.<br>Tap to<br>pause/resume.|
|**14**|**User**|Taps a caption line to edit it.|Inline text edit for that caption<br>segment. Shows timestamp<br>range of that segment.|Edit mode for<br>that caption<br>bubble.<br>Keyboard opens.|
|**15**|**User**|Selects background music from<br>carousel. Taps to preview a<br>track.|15-second preview of track<br>plays against the clip visuals.<br>Tracks pre-buffered from S3.|Music playing<br>indicator. Track<br>name + genre<br>badge shown.|
|**16**|**User**|Taps "Use This Track".|Music selection saved. Full<br>preview now plays with music +<br>captions.|Music badge<br>appears on clip<br>preview.|



_Confidential — For NexaClip Design & Architecture Team  ·  March 2026_ 

NexaClip  ·  UX Flow Document  ·  MVP Phase 1 

20 

|**#**|**Actor**|**Action / User Input**|**System Response**|**Screen State**|
|---|---|---|---|---|
|**17**|**User**|Enters clip title (required) and<br>description (optional).|Title field: max 80 chars,<br>character counter. Description<br>field: max 300 chars.|Character<br>counters update<br>in real time.|
|**18**|**User**|Taps "Publish to Feed".|POST /content/{id}/publish.<br>Content enters moderation<br>queue. If <3s: show subtle<br>"Reviewing content..." text on<br>button. Claude moderation<br>check runs.|"Publishing..."<br>button state.<br>Subtle overlay if<br>>2 seconds.|
|**19**|**System**|Moderation returns<br>APPROVED.|Content status updated to<br>PUBLISHED. Feed Service<br>notified. Content appears in<br>user's profile and followers'<br>feeds.|Success state<br>activates.|
|**20**|**System**|Success confirmation screen.|Full-screen confirmation: clip<br>thumbnail, "Your clip is live!",<br>View on Feed (primary), Share<br>link (secondary), Create Another<br>(tertiary).|Confetti<br>animation.<br>Celebration<br>moment.|



##### **5.4  Timeline Editor — UX Specifications** 

|**Component**|**Specification**|
|---|---|
|Timeline strip|Full width of screen. Frames extracted every 2s and rendered as thumbnails.<br>Renders progressively (skeleton → real frames).|
|Trim handles|Left handle: red/orange. Right handle: red/orange. Handle width: 24px.<br>Minimum gap between handles: 5 seconds of footage.|
|Selected region|Area between handles highlighted with a purple overlay at 30% opacity.|
|Scrubber|Thin vertical white line with circular top. Draggable. Video time shown as<br>overlay above scrubber head.|
|Playback|Tap play button on video above timeline. Tap again to pause. Video only plays<br>within trim region during preview.|
|Duration badge|Fixed badge showing "Selected: 0:23 / 1:30 max" for free users, "0:23 / 3:00<br>max" for Pro. Updates in real time as handles move.|
|Zoom|Pinch to zoom in on timeline for more precise trimming. Zoom out to see full<br>recording. Double-tap to reset zoom.|
|Accessibility|Trim handles are keyboard accessible. Arrow keys move handle by 0.5s<br>increments. Shift+arrow = 5s increments.|



##### **5.5  Error States — Clip Trimmer** 

|**Upload fails mid-way**|**File type not**<br>**supported**|**File too large (free tier)**|**Whisper transcription**<br>**fails**|
|---|---|---|---|
|"Upload interrupted. Your|Immediate inline|"This file is 1.2GB — free|"Couldn't detect audio in|
|progress is saved up to|message below file|accounts support up to|this clip. You can add|



_Confidential — For NexaClip Design & Architecture Team  ·  March 2026_ 

NexaClip  ·  UX Flow Document  ·  MVP Phase 1 

21 

**Upload fails mid-way File type not File too large (free tier) Whisper transcription supported fails** X% — retry? We'll picker: "NexaClip 500MB. Trim the captions manually or skip resume where you left supports MP4, MOV, and recording to a shorter captions." Both options off." Retry button starts AVI files. Your file is section before uploading, visible. Manual from last uploaded chunk .WMV — try converting it or upgrade to Pro for up captioning opens a (S3 multipart upload). first." Link to free to 5GB uploads." simple text editor. converter tool. Upgrade CTA inline. 

_Confidential — For NexaClip Design & Architecture Team  ·  March 2026_ 

NexaClip  ·  UX Flow Document  ·  MVP Phase 1 

22 

#### **Feature F3 — Social Feed & User Accounts** 

###### _Discovery · Community · Retention engine_ 

The Social Feed must feel alive from the first launch. An empty feed is the most common reason new users abandon a social product. The UX strategy for the MVP is to seed the feed with curated content from the NexaClip team and early beta creators so that new users never see a blank screen. 

##### **6.1  Feed Content Card Design** 

**SCREEN  Content Card — Standard** **<mark>(</mark> a** **<mark>pp</mark> ears in feed for both cli** **<mark>p</mark> s and ima** **<mark>g</mark> es** **<mark>)</mark>** 

Header: User avatar (40px circle) + Username (bold) + Game niche badge + Time ago — Right: Follow button <mark>(</mark> if not followin <mark>g)</mark> 

Content: Full-width ima <mark>g</mark> e or video thumbnail with <mark>p</mark> la <mark>y</mark> button overla <mark>y (</mark> 16:9 as <mark>p</mark> ect ratio <mark>)</mark> 

Video cli <mark>p</mark> s: Duration bad <mark>g</mark> e <mark>(</mark> bottom ri <mark>g</mark> ht of thumbnail <mark>)</mark> 

AI Generated bad <mark>g</mark> e: Small <mark>p</mark> ur <mark>p</mark> le <mark>p</mark> ill "AI" in to <mark>p</mark> -left corner of content <mark>(</mark> all AI- <mark>g</mark> enerated content <mark>)</mark> 

Watermark: For free-tier content <mark>,</mark> NexaCli <mark>p</mark> watermark overlaid on ima <mark>g</mark> e <mark>(</mark> bottom-ri <mark>g</mark> ht <mark>,</mark> semi-trans <mark>p</mark> arent <mark>)</mark> Ca <mark>p</mark> tion: Shown below content. Max 2 lines visible with "...more" ex <mark>p</mark> ansion 

Hashta <mark>g</mark> s: Ta <mark>pp</mark> able chi <mark>p</mark> s below ca <mark>p</mark> tion — ta <mark>p</mark> navi <mark>g</mark> ates to hashta <mark>g</mark> feed 

En <mark>g</mark> a <mark>g</mark> ement row: Heart icon + count · Comment icon + count · Share icon · Bookmark icon <mark>(</mark> ri <mark>g</mark> ht-ali <mark>g</mark> ned <mark>)</mark> Bottom <mark>p</mark> addin <mark>g</mark> : 8 <mark>p</mark> x before next card se <mark>p</mark> arator 

##### **6.2  Interaction Flow — Feed Browsing** 

|**#**|**Actor**|**Action / User Input**|**System Response**|**Screen State**|
|---|---|---|---|---|
|**1**|**System**|User lands on Home tab after<br>onboarding.|Check if user follows anyone. If<br><5 follows: load discovery feed<br>(curated + trending). If 5+<br>follows: load personalised feed<br>(following + trending mixed<br>70/30).|Feed loads with<br>skeleton cards<br>first|
|**2**|**System**|First 20 posts load.|GET /feed?cursor=null&limit=20.<br>Posts hydrated from<br>PostgreSQL. CDN URLs<br>returned. Skeleton cards<br>replaced with real content as<br>each post resolves.|Skeleton →<br>content: each<br>card snaps in<br>individually|
|**3**|**User**|Scrolls down the feed.|Scroll position tracked. When<br>user reaches post 15, pre-fetch<br>next 20 posts in background. No<br>loading interruption.|Infinite scroll.<br>Next batch loads<br>silently.|
|**4**|**User**|Taps on a video clip thumbnail.|Navigate to Single Post View<br>(S08). Video auto-plays muted<br>on load. Audio unmutes on user<br>tap.|S08 slides up.<br>Video plays<br>muted.|



_Confidential — For NexaClip Design & Architecture Team  ·  March 2026_ 

NexaClip  ·  UX Flow Document  ·  MVP Phase 1 

23 

|**#**|**Actor**|**Action / User Input**|**System Response**|**Screen State**|
|---|---|---|---|---|
|**5**|**User**|Taps the heart icon on a post.|POST /content/{id}/like.<br>Optimistic update: counter +1<br>immediately in UI. Confirm with<br>server in background.|Heart fills with<br>animation<br>(bounce + color<br>fill).|
|**6**|**User**|Taps the comment icon.|Comment sheet slides up from<br>bottom. Existing comments load.<br>Keyboard opens for new<br>comment.|Bottom sheet:<br>previous<br>comments +<br>input field|
|**7**|**User**|Types a comment and taps<br>Send.|POST /content/{id}/comment.<br>Comment appears at top of the<br>sheet immediately. Push<br>notification sent to post owner<br>(background).|Comment<br>appears instantly<br>above input field.|
|**8**|**User**|Taps "Follow" on a content card.|POST /users/{id}/follow. Feed<br>algorithm weight updated for this<br>creator. Follow button changes<br>to "Following" with check icon.|"Follow" →<br>"Following✓"<br>with subtle<br>animation.|
|**9**|**User**|Taps the share icon.|Generate shareable link (with<br>UTM params for acquisition<br>tracking). Native share sheet<br>appears: Copy Link, Share to<br>WhatsApp, Share to Instagram<br>Stories.|Native OS share<br>sheet opens.|
|**10**|**User**|Taps a creator's avatar to view<br>their profile.|Navigate to User Profile screen<br>(S09). Load creator's posts grid,<br>follower/following counts, game<br>niche.|S09 slides in<br>from right.|



##### **6.3  User Profile Screen (S09)** 

###### **SCREEN  S09 — User Profile** 

To <mark>p</mark> : Lar <mark>g</mark> e avatar <mark>(</mark> 80 <mark>p</mark> x <mark>)</mark> + Dis <mark>p</mark> la <mark>y</mark> name <mark>(</mark> bold <mark>,</mark> 20 <mark>p</mark> x <mark>)</mark> + Username <mark>(@</mark> handle <mark>, g</mark> ra <mark>y)</mark> Stats row: Posts count · Followers count · Followin <mark>g</mark> count — all ta <mark>pp</mark> able <mark>(</mark> shows list <mark>)</mark> Game niche bad <mark>g</mark> es: Horizontal chi <mark>p</mark> s showin <mark>g g</mark> ame ta <mark>g</mark> s <mark>(</mark> Valorant <mark>,</mark> Fortnite etc. <mark>)</mark> Bio text: Max 150 chars. "Edit Profile" button if own <mark>p</mark> rofile. Action row <mark>(</mark> other user <mark>)</mark> : Follow/Followin <mark>g</mark> button <mark>(p</mark> rimar <mark>y)</mark> + Messa <mark>g</mark> e <mark>(</mark> secondar <mark>y</mark> — Phase 2 <mark>)</mark> Content <mark>g</mark> rid: 3-column <mark>g</mark> rid of <mark>p</mark> ost thumbnails. Video cli <mark>p</mark> s show <mark>p</mark> la <mark>y</mark> icon + duration bad <mark>g</mark> e. Stick <mark>y</mark> tabs: Posts <mark>(</mark> default <mark>)</mark> · Liked <mark>(</mark> own <mark>p</mark> rofile onl <mark>y)</mark> 

Em <mark>p</mark> t <mark>y</mark> state: If no <mark>p</mark> osts: "Nothin <mark>g</mark> here <mark>y</mark> et. Time to create <mark>y</mark> our first cli <mark>p</mark> →" 

##### **6.4  Empty States — Feed (Critical UX Moment)** 

###### **Empty Feed Strategy — Do Not Let Users See a Blank Screen** 

The worst experience in a social app is opening the feed and seeing nothing. NexaClip must never serve an empty feed, even to brand-new users. 

_Confidential — For NexaClip Design & Architecture Team  ·  March 2026_ 

NexaClip  ·  UX Flow Document  ·  MVP Phase 1 

24 

###### **Empty Feed Strategy — Do Not Let Users See a Blank Screen** 

Strategy: 

1. All new users see a "Discovery Feed" pre-populated with curated posts from: 

- The NexaClip team account (gaming tips, app announcements) 

- Top 10 beta creator posts (recruited before launch) 

- Trending gaming clips (from the platform's public feed) 

2. A persistent "Suggested Creators" card appears at position 4 in the feed, showing 5 creators to follow with game niche tags. 

3. The empty state only appears if a user has followed accounts that have zero posts. 

Message: "No posts yet from the creators you follow. Check out Trending →" CTA takes user to the curated trending section. 

##### **6.5  First-Post Empty State (Own Profile)** 

###### **SCREEN  Em** **<mark>p</mark> t** **<mark>y</mark> Profile — First-Time User** 

Centre of screen: Game controller illustration <mark>(</mark> brand illustration st <mark>y</mark> le <mark>)</mark> Headin <mark>g</mark> : "Your sta <mark>g</mark> e is em <mark>p</mark> t <mark>y</mark> " <mark>(</mark> warm <mark>,</mark> not critical <mark>)</mark> 

Subtext: "Your first cli <mark>p</mark> or ima <mark>g</mark> e will a <mark>pp</mark> ear here. It takes 2 minutes to create somethin <mark>g</mark> worth sharin <mark>g</mark> ." CTA: "Create m <mark>y</mark> first <mark>p</mark> ost →" — <mark>p</mark> ur <mark>p</mark> le <mark>,</mark> full width 

Secondar <mark>y</mark> link: "See what's trendin <mark>g</mark> first" — text link 

_Confidential — For NexaClip Design & Architecture Team  ·  March 2026_ 

NexaClip  ·  UX Flow Document  ·  MVP Phase 1 

25 

#### **Feature F4 — Content Moderation (User-Facing UX)** 

_Invisible when working · Clear when not_ 

Moderation runs silently in the background for 95% of content. The UX challenge is handling the 5% of cases where content is flagged without alienating creators who may have made an honest mistake. The tone of all rejection messages must be explanatory and helpful — never punitive. 

##### **7.1  Moderation Flow — User Perspective** 

|**#**|**Actor**|**Action / User Input**|**System Response**|**Screen State**|
|---|---|---|---|---|
|**1**|**User**|Taps "Publish" on any content.|POST /content/{id}/publish<br>received. Moderation job<br>dispatched to HIGH priority<br>BullMQ queue.|"Publishing..."<br>button state.|
|**2**|**System**|Claude moderation check runs<br>(<3 seconds typical).|Claude API call with content text<br>+ image description. Returns:<br>decision (APPROVED /<br>REJECTED /<br>FLAG_FOR_REVIEW), reason,<br>confidence.|If <3s: user sees<br>only<br>"Publishing..." —<br>no separate<br>loading step.|
|**3**|**System**|Decision: APPROVED.|Content status → PUBLISHED.<br>Feed updated. Success<br>confirmation sent.|Immediate<br>transition to<br>success<br>confirmation.<br>User never knew<br>moderation ran.|
|**4**|**System**|Decision: FLAG_FOR_REVIEW<br>(confidence <70%).|Content published with<br>pending_review flag. User sees<br>published state. Human<br>moderator reviews within 24h. If<br>rejected post-review: user<br>notified.|Same success<br>state as<br>APPROVED. No<br>visible difference<br>to user.|
|**5**|**System**|Decision: REJECTED.|Navigate to content rejection<br>screen (S25). Do NOT show the<br>rejected content prominently —<br>show the explanation.|Rejection screen<br>slides in.|
|**6**|**System**|S25 renders with rejection<br>explanation.|Show: "We couldn't publish this<br>content" heading. Plain-<br>language reason from Claude.<br>What the user can do: Edit &<br>Retry, or Remove.|Rejection screen<br>with clear reason<br>and two action<br>options.|
|**7**|**User**|Reads the rejection reason and<br>taps "Edit & Retry".|Navigate back to content edit<br>screen (S13 for images, S18 for<br>clips). Prompt and content pre-<br>loaded. Reason shown as a<br>subtle banner at top.|Edit screen with<br>context banner:<br>"Edit to address:<br>[reason]"|
|**8**|**User**|Makes edit and taps "Publish"<br>again.|New moderation check runs.<br>Treat as a fresh submission.|Standard publish<br>flow from Step 1.|



_Confidential — For NexaClip Design & Architecture Team  ·  March 2026_ 

NexaClip  ·  UX Flow Document  ·  MVP Phase 1 

26 

##### **7.2  Rejection Screen Design (S25)** 

###### **SCREEN  S25 — Content Moderation Re** **<mark>j</mark> ection** 

To <mark>p</mark> icon: Oran <mark>g</mark> e/amber shield icon <mark>(</mark> not red — not a criminal accusation <mark>)</mark> 

Headin <mark>g</mark> : "We couldn't <mark>p</mark> ublish this content" <mark>(</mark> matter-of-fact <mark>,</mark> not alarmin <mark>g)</mark> 

Sub-headin <mark>g</mark> : "Here's wh <mark>y</mark> :" <mark>(</mark> leadin <mark>g</mark> into the ex <mark>p</mark> lanation <mark>)</mark> 

Reason card: White card with left border in amber. Shows Claude's <mark>p</mark> lain-En <mark>g</mark> lish reason. 

Exam <mark>p</mark> le: "Your ca <mark>p</mark> tion includes a <mark>p</mark> hrase that could be seen as tar <mark>g</mark> etin <mark>g</mark> a s <mark>p</mark> ecific <mark>p</mark> la <mark>y</mark> er <mark>g</mark> rou <mark>p</mark> . 

Small edits to re <mark>p</mark> hrase it would let this <mark>p</mark> ost throu <mark>g</mark> h." 

Two action buttons <mark>(</mark> e <mark>q</mark> ual visual wei <mark>g</mark> ht <mark>)</mark> : 

"Edit & Retr <mark>y</mark> " — outlined button <mark>,</mark> takes user back to edit screen 

"Remove This Post" — text link <mark>,</mark> li <mark>g</mark> hter wei <mark>g</mark> ht 

Bottom note: "Questions? Contact our team" — email link 

NO: do not show the word "banned" <mark>,</mark> "violation" <mark>,</mark> "fla <mark>gg</mark> ed" <mark>,</mark> or "ille <mark>g</mark> al" 

###### **Rejection Message Tone Guide — For Solution Architect (Claude System Prompt Input)** 

The reason field in Claude's moderation output must follow this tone guide: 

DO: Explain what was detected. "Your image contains graphic violence that is not suitable for the NexaClip community." 

DO: Give an actionable suggestion. "Removing the explicit imagery and keeping the gameplay screenshot would let this post through." 

DO NOT: Use legal or accusatory language. Not: "Your content violates our Terms of Service." DO NOT: Be vague. Not: "This content was flagged by our system." 

DO NOT: Mention AI. Not: "Our AI detected..." — just state the finding directly. 

Maximum reason length: 2 sentences. If the reason requires more, the content is probably better suited for human review (FLAG_FOR_REVIEW) than automatic rejection. 

_Confidential — For NexaClip Design & Architecture Team  ·  March 2026_ 

NexaClip  ·  UX Flow Document  ·  MVP Phase 1 

27 

#### **Feature F5 — Analytics Dashboard & Weekly Report** _Performance insight · Claude narrative · Pro upgrade driver_ 

The Analytics feature serves two very different user states: free users see enough data to understand they are missing insight, and Pro users receive Claude's narrative report that transforms raw numbers into clear actions. The upgrade journey from free to Pro analytics is one of the highest-converting moments in the product. 

##### **8.1  Analytics Dashboard — Free vs Pro View** 

|**Element**|**Free User Sees**|**Pro User Sees**|
|---|---|---|
|Total views (7 days)|Number shown clearly|Number + sparkline trend chart + %<br>change vs last week|
|Engagement rate|Number shown|Number + benchmark vs similar creators<br>(e.g. "Above average for Valorant<br>creators")|
|Best performing<br>post|Thumbnail + view count|Thumbnail + full metrics breakdown<br>(views, likes, shares, saves, completion<br>rate)|
|Best posting time|Locked — "Upgrade to unlock"|Day of week + hour shown on a heat<br>map grid|
|Audience growth|Follower count only|Daily follower delta chart for 30 days|
|Weekly report|"Your week in numbers" — raw stats<br>only|Full Claude-written narrative report card|
|Upgrade CTA|Shown after each locked element|Not shown — already Pro|



##### **8.2  Interaction Flow — Analytics Dashboard** 

|**#**|**Actor**|**Action / User Input**|**System Response**|**Screen State**|
|---|---|---|---|---|
|**1**|**User**|Taps Analytics tab.|GET<br>/analytics/metrics?range=7d.<br>Load user's metrics summary.<br>Check plan for gating.|Analytics screen<br>loads with<br>skeleton cards.|
|**2**|**System**|Metrics load.|Replace skeleton with real data.<br>For free users, locked sections<br>show a blurred overlay with an<br>unlock icon.|Metrics cards<br>snap in. Locked<br>cards show<br>purple blurred<br>content + lock<br>icon.|
|**3**|**User**|Taps a locked metric card.|Upgrade sheet (S21) slides up<br>from bottom. Shows: what this<br>metric reveals, why it matters<br>(example: "Knowing your best|S21 slides up.<br>Blur effect<br>maintains on<br>card below.|



_Confidential — For NexaClip Design & Architecture Team  ·  March 2026_ 

NexaClip  ·  UX Flow Document  ·  MVP Phase 1 

28 

|**#**|**Actor**|**Action / User Input**|**System Response**|**Screen State**|
|---|---|---|---|---|
||||posting time increased reach for<br>78% of Pro users"), Pro price.||
|**4**|**User**|Scrolls down to "This Week's<br>Report" section.|Free: Show truncated report<br>with blur after 2 lines. Pro: Show<br>full Claude narrative report.|Report card<br>visible. Free<br>users see<br>teaser; Pro users<br>see full.|
|**5**|**User (Pro)**|Taps "View Full Report" or<br>reads inline.|If Monday: new report available<br>badge shown. Load latest<br>Claude report from DB. Render<br>formatted text.|Report card<br>expands or<br>navigates to full<br>report screen.|
|**6**|**System**|Full report screen (S20) loads.|Display Claude report with<br>sections: Performance<br>Summary, What Worked, What<br>to Improve, Three Action Items<br>for This Week.|S20 renders.<br>Report text<br>formatted with<br>section<br>headings.|
|**7**|**User (Pro)**|Reads action item. Taps "Create<br>content for this →" link on action<br>item.|Navigate to Create tab (S11)<br>with the recommendation pre-<br>filled as context.|Create Hub<br>opens. Context<br>banner shows:<br>"From your<br>weekly plan:<br>[action item<br>text]"|
|**8**|**System**|New report notification (Monday<br>morning).|FCM push notification sent:<br>"Your week in review is ready —<br>here's what worked." Tapping<br>opens S20 directly.|Push notification.<br>On tap: deep link<br>to S20.|



##### **8.3  Analytics Report Screen (S20 — Pro)** 

###### **SCREEN  S20 — Weekl** **<mark>y</mark> Anal** **<mark>y</mark> tics Re** **<mark>p</mark> ort** **<mark>(</mark> Pro** **<mark>)</mark>** 

To <mark>p</mark> : "Week of March 24–30 <mark>,</mark> 2026" + small "Generated b <mark>y</mark> Claude AI" attribution bad <mark>g</mark> e Section 1 — Performance Summar <mark>y</mark> : 4 metric cards in a 2×2 <mark>g</mark> rid <mark>(</mark> views <mark>,</mark> likes <mark>,</mark> shares <mark>,</mark> com <mark>p</mark> letion rate <mark>)</mark> Section 2 — "What worked this week": Claude <mark>p</mark> ara <mark>g</mark> ra <mark>p</mark> h. Left border in teal <mark>(p</mark> ositive si <mark>g</mark> nal color <mark>)</mark> . Section 3 — "What to im <mark>p</mark> rove": Claude <mark>p</mark> ara <mark>g</mark> ra <mark>p</mark> h. Left border in amber <mark>(</mark> attention si <mark>g</mark> nal <mark>,</mark> not error <mark>)</mark> . Section 4 — "Your insi <mark>g</mark> ht this week": One hi <mark>g</mark> hli <mark>g</mark> hted insi <mark>g</mark> ht card. Back <mark>g</mark> round: <mark>p</mark> ur <mark>p</mark> le li <mark>g</mark> ht. Section 5 — "3 thin <mark>g</mark> s to tr <mark>y</mark> next week": Numbered list with action cards. 

Each action card: Icon + Action descri <mark>p</mark> tion + "Create content for this →" ta <mark>pp</mark> able link. Bottom: "Re <mark>p</mark> ort <mark>g</mark> enerated Sunda <mark>y</mark> ni <mark>g</mark> ht · Next re <mark>p</mark> ort in 6 da <mark>y</mark> s" 

Share re <mark>p</mark> ort: "Share this insi <mark>g</mark> ht" button — <mark>g</mark> enerates a card ima <mark>g</mark> e for sharin <mark>g (</mark> comin <mark>g</mark> Phase 2 <mark>)</mark> 

##### **8.4  Locked Analytics — Upgrade Conversion Flow** 

|**#**<br>**Actor**|**Action / User Input**|**System Response**|**Screen State**|
|---|---|---|---|
|**1**<br>**User**|Taps a locked metric (e.g. "Best|Upgrade sheet (S21) slides up.|S21 renders<br>|
||Posting Time").|Load upgrade comparison data.|from bottom.|



_Confidential — For NexaClip Design & Architecture Team  ·  March 2026_ 

NexaClip  ·  UX Flow Document  ·  MVP Phase 1 

29 

|**#**|**Actor**|**Action / User Input**|**System Response**|**Screen State**|
|---|---|---|---|---|
|**2**|**System**|S21 shows value-first upgrade<br>prompt.|Show: The locked metric<br>preview (e.g. heat map grid with<br>all cells blurred except one<br>example). Then: "Unlock your<br>best posting time + 12 other<br>Creator Pro features".|Value demo<br>visible. Price<br>shown below the<br>benefit list.|
|**3**|**User**|Taps "Upgrade to Pro —<br>$12/month".|Navigate to Stripe checkout<br>(web view or native Stripe SDK).<br>Pre-populate user email.|Stripe checkout<br>opens in-app.|
|**4**|**User**|Completes payment.|Stripe webhook:<br>/billing/webhook receives<br>subscription.created. Update<br>user plan in DB. Invalidate JWT<br>— reissue with plan: "pro".<br>Trigger welcome email.|Payment<br>processing.<br>Then: S22 loads.|
|**5**|**System**|S22 — Upgrade confirmed.|Full-screen confirmation:<br>"Welcome to Pro!🎉". List of<br>newly unlocked features with<br>check icons. Primary CTA: "See<br>your Analytics now →".|Celebration<br>animation.<br>Feature unlock<br>reveal.|
|**6**|**User**|Taps "See your Analytics now<br>→".|Navigate to Analytics<br>Dashboard. All locked elements<br>now unlocked. Blur overlays<br>removed.|Analytics reloads<br>— all content<br>visible. No more<br>lock icons.|



_Confidential — For NexaClip Design & Architecture Team  ·  March 2026_ 

NexaClip  ·  UX Flow Document  ·  MVP Phase 1 

30 

## **9. Cross-Feature UX Flows** 

These flows span multiple features and represent critical user journeys that must be designed holistically — not feature-by-feature. 

##### **9.1  New User Activation Flow (Day 1 Complete Journey)** 

|**Time**|**User Action**|**System Behaviour + UX Design**|
|---|---|---|
|T+0m|Installs app. Opens.|Splash screen: NexaClip logo animation (600ms). Auth<br>check: no token → Welcome slides (S02).|
|T+1m|Reads 3 welcome slides. Taps "Get<br>Started".|Navigate to S03 (Sign Up). Form: email, username,<br>password. Google/Apple SSO options.|
|T+2m|Completes signup. Taps "Create<br>Account".|Account created. JWT issued. Redirect to S05<br>(Onboarding Chat). Claude API call initiated.|
|T+3m|Completes 5-question onboarding chat.|Answers stored. Claude generates 7-day plan JSON.<br>Navigate to S06 (Plan Reveal).|
|T+4m|Reviews plan. Taps "Start with today's<br>content".|Navigate to S11 (Create Hub) with Monday plan<br>context pre-loaded.|
|T+5m|Taps "Image or Meme". Types first<br>prompt.|Navigate to S12. Auto-focus on prompt field. User<br>types their first prompt.|
|T+7m|Taps "Generate". Sees image result.|Image generated in ~6s. S13 loads with image +<br>caption suggestions. First value delivered.✓|
|T+8m|Taps "Publish to Feed".|Moderation runs (<3s). Content published. S07 (Feed)<br>loads with their post at top.|
|T+9m|Sees first post on the feed. Feels<br>proud.|Feed loads with own post + discovery feed. Follow<br>suggestions shown. Goal: follow 3+ creators.|



###### **Day 1 Activation Goal: First Value in Under 9 Minutes** 

The flow above shows that a first-time user can go from install to published content in under 9 minutes. This is the "first value moment" — the metric that predicts long-term retention more than any other in creator tools. 

Every design decision that slows this journey (extra onboarding steps, required email verification before use, complex editor UI) must be challenged and removed. 

The onboarding chat (3 minutes) is the only mandatory "slow" step, and it earns its time 

by delivering genuine personalisation. Every other step in the flow should be sub-30 seconds. 

##### **9.2  Free-to-Pro Upgrade Flow** 

_Confidential — For NexaClip Design & Architecture Team  ·  March 2026_ 

NexaClip  ·  UX Flow Document  ·  MVP Phase 1 

31 

|**#**|**Actor**|**Action / User Input**|**System Response**|**Screen State**|
|---|---|---|---|---|
|**1**|**User**|Hits a Pro-gated feature or daily<br>limit.|Show upgrade trigger<br>appropriate to the context: limit<br>banner (Image Studio), lock<br>overlay (Analytics), or feature<br>teaser (Adapter — Phase 2).|Upgrade trigger<br>visible in context.|
|**2**|**User**|Taps upgrade trigger or CTA.|Upgrade sheet (S21) slides up<br>from bottom. Shows: Value<br>headline specific to the feature<br>they were using, feature list with<br>icons, pricing.|S21 slides up.<br>Background<br>screen darkens<br>slightly.|
|**3**|**User**|Reads value proposition. Taps<br>"Upgrade to Pro".|Open Stripe checkout. Pre-fill<br>email. Show annual vs monthly<br>toggle (annual = 2 months free).|Stripe checkout<br>in-app webview<br>or native SDK.|
|**4**|**User**|Completes payment.|Stripe webhook fires. Plan<br>updated in DB. New JWT<br>issued. FCM notification: "You're<br>now Pro!".|Payment<br>confirmation.<br>Navigate to S22.|
|**5**|**System**|S22 — Welcome to Pro.|Show unlocked features with<br>animation. Primary CTA returns<br>user to where they were before<br>the upgrade flow interrupted.|"Resuming<br>where you left<br>off..." if<br>applicable.|
|**6**|**User**|Returns to the feature they<br>originally tried to use.|Feature now fully available. No<br>lock icons. Daily limits removed.|Seamless return.<br>Feature works<br>as expected.|



##### **9.3  Notification → Action Flow** 

|**#**|**Actor**|**Action / User Input**|**System Response**|**Screen State**|
|---|---|---|---|---|
|**1**|**System**|Monday 8am: Sends push<br>notification "Your week in<br>review is ready".|FCM batch send to all Pro users.<br>Notification payload includes<br>deep link to Analytics tab.|User device<br>receives push<br>notification.|
|**2**|**User**|Taps notification (app may be<br>closed).|App opens. Deep link resolves to<br>Analytics tab > Weekly Report<br>view (S20).|App opens<br>directly to S20.|
|**3**|**User**|Reads report. Taps an action<br>item "→ Create content for<br>this".|Navigate to Create Hub (S11)<br>with action item context in a<br>banner.|S11 with context<br>banner.|
|**4**|**User**|Creates content based on the<br>recommendation.|Standard create flow (S12 or<br>S15). Context maintained in the<br>banner until user publishes or<br>dismisses.|Creation flow<br>with context.|
|**5**|**User**|Publishes content.|Standard publish flow. After<br>success, return to home feed.<br>Analytics event logged:<br>"content_created_from_report".|Success screen.<br>Then home<br>feed.|



##### **9.4  Content Sharing → Acquisition Flow** 

_Confidential — For NexaClip Design & Architecture Team  ·  March 2026_ 

NexaClip  ·  UX Flow Document  ·  MVP Phase 1 

32 

|**#**|**Actor**|**Action / User Input**|**System Response**|**Screen State**|
|---|---|---|---|---|
|**1**|**User**|Taps share icon on their<br>published post.|Generate shareable link:<br>https://nexaclip.com/p/{contentId}?ref={userId}.<br>Native share sheet opens.|Native OS<br>share sheet.|
|**2**|**User**|Shares link to WhatsApp<br>or Instagram.|Link contains UTM parameters for acquisition<br>attribution.|Link shared to<br>external<br>platform.|
|**3**|**New**<br>**visitor**|Taps the shared link.|Redirect to NexaClip web view of the content<br>(mobile-optimised). Show: the content<br>prominently + creator profile + "Join NexaClip"<br>banner at bottom.|Web content<br>view. Not app-<br>specific.|
|**4**|**New**<br>**visitor**|Taps "Join NexaClip —<br>free".|Redirect to App Store / Play Store (with app<br>install deep link). Or show web signup if on<br>desktop.|App Store<br>page or web<br>signup.|
|**5**|**New user**|Installs and opens app.|Attribution tracked via referral parameter. New<br>user's onboarding pre-fills game niche based<br>on the content they saw (e.g. Valorant clip →<br>Valorant pre-selected in Q1).|Pre-<br>personalised<br>onboarding.|



_Confidential — For NexaClip Design & Architecture Team  ·  March 2026_ 

NexaClip  ·  UX Flow Document  ·  MVP Phase 1 

33 

## **10. Global UX Com onents & Patterns** **<u>p</u>** 

These components appear across multiple screens and must be designed once and used consistently. The UI/UX designer should build these as a component library before designing individual screens. 

##### **10.1  Component Inventory** 

|**Component**|**Where Used**|**Variants**|**Design Notes**|
|---|---|---|---|
|Content<br>Card|Feed (S07), Profile<br>grid (S09)|Clip card, Image card,<br>Compact card|Must support skeleton state|
|User Avatar|All social contexts|40px (feed), 56px (profile<br>header), 24px (comments)|Always circular. Fallback: initials<br>on colored bg|
|Primary<br>Button|All CTAs|Active, Disabled, Loading<br>(spinner)|Full-width in sheets. Auto-width<br>in content.|
|Tag / Chip|Game niche,<br>Hashtags, Style<br>picker|Selectable, Selected,<br>Disabled, AI badge|48px min touch target|
|Bottom<br>Sheet|Upgrade, Comments,<br>Share, Settings|Half-height, Three-quarter,<br>Full-screen|Swipe down to dismiss. Drag<br>handle visible.|
|Toast<br>Notification|Publish success,<br>Follow, Error|Success (teal), Warning<br>(amber), Error (red), Info<br>(purple)|Auto-dismiss 3 seconds. Swipe<br>up to dismiss early.|
|Skeleton<br>Screen|All async content|Card skeleton, List skeleton,<br>Report skeleton|Animated pulse. Match exact<br>shape of content.|
|Progress<br>Bar|File upload, AI<br>processing|Determinate (upload),<br>Indeterminate (processing)|Show % and time remaining<br>when known.|
|Empty State|Feed, Profile,<br>Analytics|Full-page, Inline, Section|Always includes illustration +<br>CTA.|
|Upgrade<br>Prompt|All Pro-gated features|Inline lock, Full sheet,<br>Banner|Value-first always. Never lead<br>with price.|
|Confirmation<br>Dialog|Delete, Cancel,<br>Irreversible actions|Two-button (confirm / cancel)|Destructive action button in red.|
|Navigation<br>Bar|All main screens|5 tabs with icons + labels|Active tab: purple fill. Inactive:<br>gray.|



##### **10.2  Loading State Patterns** 

**Skeleton Screen** 

Used for: Feed cards, Analytics metrics, Profile content. The skeleton placeholder must exactly match the shape and size of the real content it will replace. This prevents layout shift (CLS) and makes the loading feel intentional. 

_Confidential — For NexaClip Design & Architecture Team  ·  March 2026_ 

NexaClip  ·  UX Flow Document  ·  MVP Phase 1 

34 

Used for: AI image generation, Clip AI polish, Claude report generation. Show a 3-step progress indicator with friendly labels. Steps should check off **Processing Screen** sequentially. If the process has a known duration, show a progress bar. If indeterminate, use a pulsin <mark>g</mark> animation on the step icon. Used for: Post publishing, Comment submit, Follow action. The action button **Inline Loading** transforms: text disappears, a spinner appears in the same button. The spinner is the same size as the text was. No la <mark>y</mark> out shift. 

##### **10.3  Error Handling Principles** 

|**Error Type**|**UX Treatment**|
|---|---|
|Network offline|Persistent banner at top of screen: "You're offline — some features may be<br>unavailable." Content already loaded stays visible and usable. Content requiring<br>network shows a retry option.|
|API error (500-level)|Toast notification: "Something went wrong on our end — we've been notified."<br>Never show a status code or stack trace. Include a Retry button that retries the<br>exact same action.|
|API rate limit (429)|For Claude features: "Our AI is very busy right now. Your request is queued and will<br>complete in about 30 seconds." User can stay on screen or navigate away —<br>notification fires when complete.|
|Input validation<br>error|Inline error below the field, in red, with specific message. Example: "Username must<br>be 3–20 characters, letters and numbers only." Appears on blur, not on type.|
|Slow connection|After 5 seconds, show subtle "Still loading..." under any spinner or skeleton. After 15<br>seconds, offer a "Try again" link inline.|
|Session expired|Redirect to login screen. Show message: "Your session ended — log in again to<br>continue." After login, attempt to return user to where they were (store last route in<br>local storage).|



##### **10.4  Upgrade Screen (S21) — Design Specification** 

**SCREEN  S21 — U** **<mark>pg</mark> rade to Pro Sheet** 

Handle bar at to <mark>p (</mark> dra <mark>g</mark> indicator <mark>)</mark> 

Hero: The feature the user was <mark>j</mark> ust tr <mark>y</mark> in <mark>g</mark> to use <mark>,</mark> with a <mark>p</mark> review ima <mark>g</mark> e or icon 

Headline: "Unlock <mark>[</mark> s <mark>p</mark> ecific feature name <mark>]</mark> " — NOT "U <mark>pg</mark> rade <mark>y</mark> our account" 

Sub-headline: "Ever <mark>y</mark> thin <mark>g</mark> in Pro:" <mark>(</mark> leads the feature list <mark>,</mark> not the <mark>p</mark> rice <mark>)</mark> 

Feature list <mark>(</mark> Pro <mark>)</mark> : 6 items with <mark>p</mark> ur <mark>p</mark> le check icons 

- ✓ Unlimited AI ima <mark>g</mark> e + meme <mark>g</mark> eneration 

- ✓ Weekl <mark>y p</mark> erformance re <mark>p</mark> ort <mark>(</mark> written b <mark>y</mark> Claude AI <mark>)</mark> 

- ✓ Multi- <mark>p</mark> latform content ada <mark>p</mark> ter 

- ✓ No watermarks on <mark>y</mark> our content 

- ✓ Priorit <mark>y</mark> cli <mark>p p</mark> rocessin <mark>g</mark> 

- ✓ Creator coachin <mark>g</mark> — 24/7 AI chat 

_Confidential — For NexaClip Design & Architecture Team  ·  March 2026_ 

NexaClip  ·  UX Flow Document  ·  MVP Phase 1 

35 

###### **SCREEN  S21 — U** **<mark>pg</mark> rade to Pro Sheet** 

Pricin <mark>g</mark> : " <mark>$</mark> 12 / month" in lar <mark>g</mark> e text. Below: "Cancel an <mark>y</mark> time. No commitments." Annual to <mark>gg</mark> le: "Save 17% — Pa <mark>y</mark> annuall <mark>y ($</mark> 10/month <mark>)</mark> " CTA: "Start Pro now →" — full width <mark>, p</mark> ur <mark>p</mark> le Secondar <mark>y</mark> : "Ma <mark>y</mark> be later" — text link <mark>,</mark> small <mark>,</mark> not com <mark>p</mark> etin <mark>g</mark> with the CTA 

_Confidential — For NexaClip Design & Architecture Team  ·  March 2026_ 

NexaClip  ·  UX Flow Document  ·  MVP Phase 1 

36 

## **11. Desi n Handoff Notes** **<u>g</u>** 

This section contains the specific notes for the Senior UI/UX Designer to produce the design assets and for the Senior Solution Architect to align backend behaviour with design expectations. 

##### **11.1  Screen Priority Order for Design** 

Design screens in this order to unlock backend development in parallel. Backend work starts as soon as auth APIs are specced in S03/S04. 

|**#**|**Scree**|**n**|**Dependency**|**Why This Priority**|
|---|---|---|---|---|
|1|S03 —|Sign Up|None — first screen users see|Backend needs auth API<br>contract to start Identity<br>Service|
|2|S04 —|Log In|S03 design (shared components)|Reuses S03 components —<br>fast to design|
|3|S05 —|Onboarding Chat|S03/S04 done|Claude integration starts in<br>Month 1 — needs UI spec<br>early|
|4|S06 —|Plan Reveal|S05 done|Completes onboarding loop|
|5|S11 —|Create Tab Hub|None (standalone)|Unblocks both S12 and S15<br>backend work|
|6|S12 —|Image Studio Input|S11 done|Image generation feature starts<br>in Month 2|
|7|S13 —|Image Studio Result|S12 done|Result screen completes the<br>image creation loop|
|8|S07 —|Home Feed|S09 needed for card user info|Feed is the daily driver —<br>needs to be right|
|9|S09 —|User Profile|None (standalone)|Used in feed cards and<br>standalone|
|10|S15 —|Clip Upload|S11 done|Clip trimmer starts in Month 2|
|11|S16 —|Clip Timeline Editor|S15 done|Most complex screen — design<br>needs careful attention|
|12|S17 —|AI Polish|S16 done|Progress screen — simpler to<br>design|
|13|S18 —|Review & Publish|S17 done|Completes clip creation loop|
|14|S19 —|Analytics Dashboard|S07 done (shares patterns)|Month 2 feature|
|15|S20 —|Weekly Report (Pro)|S19 done|Pro gated — can be designed<br>alongside S19|
|16|S21 —|Upgrade Sheet|S19 done (trigger context)|Needed before public launch|



_Confidential — For NexaClip Design & Architecture Team  ·  March 2026_ 

NexaClip  ·  UX Flow Document  ·  MVP Phase 1 

37 

|**#**|**Screen**|**Dependency**|**Why This Priority**|
|---|---|---|---|
|17|S22 — Upgrade Confirmed|S21 done|Celebration screen — fun to<br>design|
|18|S25 — Rejection Screen|S12/S13/S18 done|Error state — important but not<br>blocking|
|19|S23 — Settings|Last|Settings can be<br>functional/minimal for MVP|
|20|S02 — Welcome Slides|Last|Marketing content —<br>independent of product<br>screens|



##### **11.2  Component Library Build Order (for Designer)** 

- **Week 1: Typography scale, color tokens, spacing system, icon set selection.** 

- Week 1: Button component (all variants). Text Input component (all variants). Avatar component. 

- **Week 2: Content Card component. Navigation Bar component. Bottom Sheet template.** 

- Week 2: Tag/Chip component. Toast Notification component. Progress Bar component. 

- **Week 3: Skeleton Screen templates (card, list, report). Empty State template.** 

- Week 3: Upgrade Prompt sheet. Confirmation Dialog. 

- **Week 4 onward: Feature-specific screens using the component library.** 

##### **11.3  Backend State → UI State Mapping (for Architect)** 

Every backend content status maps to a specific UI state. This table is the contract between the backend and frontend. 

|**Backend Status**|**User Sees**|**Icon / Color**|**CTA Available**|
|---|---|---|---|
|PROCESSING (upload)|Progress bar<br>with % and time<br>estimate|Upload progress indicator|Cancel upload|
|UPLOADED (awaiting<br>trim)|Clip ready in<br>trimmer editor|None — editor open|Trim + AI Polish|
|TRANSCRIBING<br>(Whisper)|Step 1 of 3<br>spinner in S17|Animated circle step 1|None during processing|
|AI_POLISHING (effects)|Step 2 + 3<br>spinner in S17|Animated circle steps 2+3|None during processing|
|READY_TO_PUBLISH|All polish done<br>— review screen<br>S18|Green check on steps|Publish to Feed|
|PENDING_MODERATION|Subtle<br>"Reviewing..."<br>text on Publish<br>button|Loading spinner|None — brief wait|



_Confidential — For NexaClip Design & Architecture Team  ·  March 2026_ 

NexaClip  ·  UX Flow Document  ·  MVP Phase 1 

38 

|**Backend Status**|**User Sees**|**Icon / Color**|**CTA Available**|
|---|---|---|---|
|PUBLISHED|Post visible in<br>feed. Profile grid.|No status shown —<br>content is live|Share, Edit, Delete|
|PENDING_REVIEW<br>(flagged)|Post visible in<br>feed. "Under<br>review" badge<br>only visible to<br>owner.|Small info dot on post<br>(owner view only)|None — awaiting human<br>review|
|REJECTED|Rejection screen<br>S25 shown. Post<br>not in feed.|Amber shield icon|Edit & Retry or Remove|
|DELETED|Removed from<br>feed and profile.<br>Link shows 404.|None visible|None|



##### **11.4  Animation & Motion Specification** 

|**Motion Type**|**Specification for Developer**|
|---|---|
|Screen transition<br>(navigate forward)|Slide in from right. Duration: 300ms. Easing: ease-in-out.|
|Screen transition<br>(navigate back)|Slide out to right. Duration: 250ms. Easing: ease-in.|
|Bottom sheet open|Slide up from bottom. Duration: 350ms. Spring: damping 0.8.|
|Bottom sheet close|Slide down. Duration: 250ms. Easing: ease-in.|
|Like animation|Heart: scale 1.0 → 1.4 → 1.0 with color fill. Duration: 250ms total.|
|Content card load|Fade in + slight upward translate (0 → translateY 8px). Duration: 200ms. Stagger:<br>50ms per card.|
|Skeleton to content|Opacity fade: skeleton 1.0 → 0.0 as content 0.0 → 1.0. Duration: 150ms.|
|Success confetti|Particle burst from content thumbnail. 20 particles. Duration: 1.2s. Fade out from<br>0.8s.|
|Publish button loading|Text fades out (100ms), spinner fades in (100ms). No layout shift — spinner<br>same size as text.|
|Claude message<br>stream|Characters appear at 40ms per character average. Cursor blink while typing.|
|Upgrade sheet<br>features|Feature list items stagger in: 60ms delay between each item. Slide up + fade in.|
|Onboarding chip<br>options|Chips stagger in after Q is rendered: 50ms between each chip.|



_Confidential — For NexaClip Design & Architecture Team  ·  March 2026_ 

NexaClip  ·  UX Flow Document  ·  MVP Phase 1 

39 

## **12. UX Acce tance Criteria** **<u>p</u>** 

These criteria define when each feature is considered UX-complete. Both the Architect and Designer sign off against these before any feature is marked done. 

|**#**|**Feature**|**Acceptance**<br>**Criterion**|**Measured By**|**Pass Threshold**|
|---|---|---|---|---|
|1|F2 Onboarding|New user reaches<br>first generated<br>content within 10<br>minutes of sign-up|Timed user test +<br>analytics event|95% of test users pass|
|2|F2 Onboarding|User receives a 7-<br>day plan that<br>references their<br>specific game niche|Manual review of 10<br>onboarding<br>sessions|All 10 contain game-specific<br>content|
|3|F1 Image Studio|First image<br>generated with no<br>errors in under 10<br>seconds|Load time<br>measurement (P50,<br>P90)|P50 < 8s, P90 < 12s|
|4|F1 Image Studio|Free user limit hit →<br>upgrade sheet<br>shown within 1<br>interaction|Manual test: hit<br>limit, observe<br>behaviour|100% shows upgrade sheet|
|5|F6 Clip Trimmer|Upload progress<br>shows accurate %<br>throughout upload|XHR progress<br>event accuracy test|±5% accuracy|
|6|F6 Clip Trimmer|Whisper captions<br>generated and<br>visible within 60s of<br>upload|Timed test with 30s<br>clip|P50 < 45s, P90 < 90s|
|7|F3 Social Feed|No new user sees<br>an empty feed at<br>any point in<br>onboarding|Test: new account<br>→ feed → verify<br>content exists|100% see content|
|8|F3 Social Feed|Like action reflected<br>in UI within 100ms<br>(optimistic)|Browser DevTools:<br>measure UI update<br>time|100ms or under|
|9|F4 Moderation|Content passes<br>moderation and<br>publishes in under 5<br>seconds|Timed test with 20<br>sample posts|P50 < 3s, P90 < 5s|
|10|F4 Moderation|Rejection<br>messages are<br>understood by<br>users without<br>explanation|User test: show<br>message, ask user<br>what to do|90% know what to do next|



_Confidential — For NexaClip Design & Architecture Team  ·  March 2026_ 

NexaClip  ·  UX Flow Document  ·  MVP Phase 1 

40 

|**#**|**Feature**|**Acceptance**<br>**Criterion**|**Measured By**|**Pass Threshold**|
|---|---|---|---|---|
|11|F5 Analytics|Free vs Pro<br>analytics difference<br>clearly understood<br>by free users|User test: 10 free<br>users — what is<br>Pro?|9/10 can explain the difference|
|12|F5 Analytics|Pro users can<br>navigate to weekly<br>report in ≤2 taps<br>from home|Manual navigation<br>test|100% complete in ≤2 taps|
|13|Global|All screens pass<br>accessibility<br>(WCAG 2.1 AA)<br>minimum|Automated<br>Lighthouse +<br>manual screen<br>reader test|Lighthouse score ≥ 90|
|14|Global|No screen causes<br>layout shift during<br>skeleton → content<br>load|Cumulative Layout<br>Shift measurement|CLS score < 0.1|



###### **Final Note to the Design & Architecture Team** 

This document is a living specification. As beta user feedback arrives in Month 3, specific flows may need adjustment based on real user behaviour. 

The flows described here represent the ideal journey. Real users will deviate — they will skip steps, tap the wrong thing, lose connection mid-flow, and come back days later. Designing for those deviations is as important as designing the happy path. 

The three most common first-use failure points in products like this are: 

1. Signup friction (too many required fields, mandatory email verification) 

2. Empty feed on first load (no content to engage with) 

3. First AI result disappointing (wrong expectation set by the prompt placeholder) 

This document has addressed all three. Hold the line on these solutions. 

Good luck building NexaClip. 

_Confidential — For NexaClip Design & Architecture Team  ·  March 2026_ 

