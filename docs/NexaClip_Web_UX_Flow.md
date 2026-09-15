NexaClip  ·  Web Application UX Flow  ·  End-to-End Interaction Design 

1 

# **NexaClip** 

## AI Creator Intelligence Platform 

### **Complete Web Application UX Flow** 

End-to-End User Journey & Interaction Design  ·  Desktop Web App _Version 1.0  ·  March 2026  ·  For UI/UX Designer & Solution Architect_ 

|**Actor Color Key**|**State Color Key**|
|---|---|
|Blue = User action on screen|Loading = data or AI processing|
|Teal = System / backend response|Empty = no content yet exists|
|Purple = Claude AI involvement|Error = something went wrong|
|Red = Error condition|Success = action completed|



###### **Document Scope & Purpose** 

This document defines the complete end-to-end UX flow for the NexaClip web application. It is structured as a sequence of user journeys — from first visit through every feature interaction. Each journey shows: what the user sees on their desktop browser, what happens in the backend, what state the UI enters, and how errors are handled. 

This is a WEB APPLICATION document. All layouts are desktop-first (1280px+). 

There is no mobile app scope in this document. 

SECTIONS COVERED: 

1. Site Map & Navigation Architecture 

2. Journey 1 — First Visit & Registration 

3. Journey 2 — Claude Onboarding Chat 

4. Journey 3 — Image & Meme Creation 

5. Journey 4 — Gaming Clip Upload & Editing 

6. Journey 5 — Social Feed & Engagement 

7. Journey 6 — User Profile Management 

8. Journey 7 — Analytics Dashboard & Weekly Report 

9. Journey 8 — Creator Coach (Claude Chat) 

10. Journey 9 — Free-to-Pro Upgrade 

11. Journey 10 — Settings & Account Management 

_Confidential  ·  For UI/UX Designer & Solution Architect  ·  March 2026  ·  Desktop Web App — v1.0_ 

NexaClip  ·  Web Application UX Flow  ·  End-to-End Interaction Design 

2 

**Document Scope & Purpose** 

12. Cross-Journey System Flows (moderation, notifications) 

13. Error Handling & Recovery Flows 

14. Web-Specific UX Patterns Reference 

_Confidential  ·  For UI/UX Designer & Solution Architect  ·  March 2026  ·  Desktop Web App — v1.0_ 

NexaClip  ·  Web Application UX Flow  ·  End-to-End Interaction Design 

3 

## **1. Site Ma & Navi ation Architecture** **<u>p g</u>** 

The NexaClip web application has two distinct zones: the public marketing zone (accessible before login) and the authenticated product zone (accessible after login). Navigation, layout, and visual language differ between zones. 

##### **1.1  Complete Site Map** 

|**Zone**|**URL Path**|**Page Name**|**Auth Required**|**Primary Purpose**|
|---|---|---|---|---|
|Public|nexaclip.com|Homepage (W01)|No|Convert visitors to<br>signups|
|Public|/features|Features (W02)|No|Deep-dive product<br>demo|
|Public|/pricing|Pricing (W03)|No|Plan comparison and<br>signup|
|Public|/login|Login (W04)|No (redirects to<br>/feed if authed)|Return user<br>authentication|
|Public|/signup|Signup (W05)|No (redirects to<br>/onboarding if<br>authed)|New user registration|
|Public|/blog|Blog (W06)|No|Content marketing|
|Public|/p/:id|Public Post View|No|Shared content preview|
|Auth|/onboarding|Onboarding Chat|Yes (new<br>users only)|Claude setup — shown<br>once|
|Auth|/feed|Home Feed (A01)|Yes|Daily content<br>consumption|
|Auth|/create|Create Hub (A02)|Yes|Content creation<br>gateway|
|Auth|/create/image|Image Studio (A03)|Yes|AI image & meme<br>generation|
|Auth|/create/clip|Clip Upload(A04a)|Yes|Video upload entry|
|Auth|/create/clip/:id/edit|Clip Editor (A04b)|Yes|Trim + AI polish +<br>publish|
|Auth|/analytics|Analytics (A05)|Yes|Performance<br>dashboard|
|Auth|/coach|Creator Coach (A06)|Yes (Pro:<br>unlimited,<br>Free: 3 msgs)|Claude AI chat<br>coaching|
|Auth|/feed/post/:id|Post Detail (A07)|Yes|Full post with<br>comments|
|Auth|/users/:id|User Profile (A08)|Yes|Other creator profile|
|Auth|/profile|Own Profile (A09)|Yes|Self profile view|



_Confidential  ·  For UI/UX Designer & Solution Architect  ·  March 2026  ·  Desktop Web App — v1.0_ 

NexaClip  ·  Web Application UX Flow  ·  End-to-End Interaction Design 

4 

|**Zone**|**URL Path**|**Page Name**|**Auth Required**|**Primary Purpose**|
|---|---|---|---|---|
|Auth|/profile/edit|Edit Profile (A10)|Yes|Update profile data|
|Auth|/my-content|Content Library (A11)|Yes|All created content<br>management|
|Auth|/upgrade|Upgrade Page (A12)|Yes|Subscription upgrade|
|Auth|/settings|Settings (A13)|Yes|Account, billing,<br>preferences|
|System|/404|Not Found|No|Error recovery|



##### **1.2  Navigation Architecture by Zone** 

|**Navigation**<br>**Component**|**Marketing Zone**|**App Zone**|
|---|---|---|
|Primary nav|TopNav — fixed 72px. Logo + 4 nav<br>links + 2 CTA buttons. Transparent<br>on hero, white + shadow after scroll.|SideNav — fixed left 240px. Collapsible to<br>64px icon-only. All app navigation lives<br>here.|
|Secondary nav|None — all links in TopNav|TopBar — 64px fixed top. Page title +<br>search + notifications + user menu.|
|Page transitions|Full page loads (standard links)|SPA client-side routing (Angular Router).<br>Fade transition 200ms between routes.|
|Auth state check|Every page: if JWT valid and<br>unexpired → redirect to /feed|Every page: if no valid JWT → store current<br>URL in localStorage, redirect to /login|
|Footer|4-column footer on all marketing<br>pages|No footer in app zone — sidebar is the<br>persistent navigation|
|Breadcrumbs|None — flat marketing structure|Present on deep pages: Create → Clip<br>Editor. Analytics → Weekly Report.|



##### **1.3  URL History & Browser Navigation** 

|**Browser Behaviour**|**Implementation**|
|---|---|
|Back button support|Angular Router uses HTML5 History API. Back button navigates within SPA<br>correctly. No page reloads inside the app zone.|
|URL sharing|All /feed/post/:id URLs are publicly accessible with Open Graph metadata for<br>social sharing previews. Auth-only pages redirect to login then return after auth.|
|Deep link handling|Push notifications link directly to specific screens. Unauthenticated deep links<br>stored in localStorage as nx_return_to. Restored after login.|
|Tab title|Dynamic Angular Title service. Format: Page Name — NexaClip. E.g.<br>"Analytics — NexaClip", "Home Feed — NexaClip".|
|Favicon|32px purple NexaClip logomark. No notification badge on favicon for MVP.|



_Confidential  ·  For UI/UX Designer & Solution Architect  ·  March 2026  ·  Desktop Web App — v1.0_ 

NexaClip  ·  Web Application UX Flow  ·  End-to-End Interaction Design 

5 

#### **Journey 1 — First Visit & Registration** 

_First impression through account creation  ·  3–5 minutes_ 

This journey covers a new visitor arriving at nexaclip.com for the first time through to completing account creation and entering the onboarding flow. The primary goal of this journey is to convert intent into a registered account with minimum friction. 

##### **J1.1 — First Visit Journey Map** 

|**Awareness**<br>**(Before site)**|**User Steps**|**Emotional State**|**Web UX Consideration**|
|---|---|---|---|
||User encounters NexaClip via shared<br>clip link, social post, or search result|_Curious, zero_<br>_commitment_|Open Graph preview for<br>shared links shows real<br>generated content to create<br>desire|
||Clicks through to nexaclip.com|_Slight skepticism_|Fast initial page load critical<br>— target < 2s LCP|
|**Homepage**<br>**(W01)**|**User Steps**|**Emotional State**|**Web UX Consideration**|
||Lands on homepage. Sees hero: dark<br>navy full-width, large headline, live AI<br>demo widget on right|_First impression_<br>_formed in 3_<br>_seconds_|Hero must load above the fold<br>at 1280px+ — no scroll<br>required to see the CTA|
||Watches demo widget generate a<br>gaming image in real time|_Engaged — the_<br>_demo is real_<br>_product output_|Demo widget auto-runs on<br>load. No interaction required<br>from user|
||Scrolls down — reads feature sections|_Building_<br>_understanding_|Scroll-triggered animations<br>reveal feature cards|
||Reads social proof bar (game logos)|_Trust signals land_|Social proof bar uses logos<br>not text — scans in <1 second|
||Sees pricing teaser at bottom|_Price anchoring_|Pricing teaser says $0 to start<br>— removes cost anxiety|
||Clicks "Start for free" CTA|_Decision to try_|CTA button uses --shadow-<br>purple on hover, scale on<br>press|
|**Signup (W05)**|**User Steps**|**Emotional State**|**Web UX Consideration**|
||Arrives at /signup page|_Slight friction_<br>_(expected)_|Signup page has no TopNav<br>— single focus on the form|
||Reads form: Email, Username,<br>Password fields|_Evaluating effort vs_<br>_reward_|3 fields only. No phone, no<br>DOB, no captcha visible (use<br>invisible reCAPTCHA)|
||Optionally uses Google/Apple SSO|_Considering the_<br>_easier path_|SSO buttons equally<br>prominent as email form|



_Confidential  ·  For UI/UX Designer & Solution Architect  ·  March 2026  ·  Desktop Web App — v1.0_ 

6 

NexaClip  ·  Web Application UX Flow  ·  End-to-End Interaction Design 

|**Signup (W05)**|**User Steps**|**Emotional State**|**Web UX Consideration**|
|---|---|---|---|
||Completes form — taps Create Account|_Committed —_<br>_clicking button_|Button loading state:<br>"Creating your account..." +<br>spinner|
||Sees email verification note (non-<br>blocking)|_Mild anxiety: will_<br>_this work?_|Verification note: "Check your<br>inbox — you can verify later."<br>Never block on email<br>verification|
||Redirected into onboarding flow|_Relief — moving_<br>_forward_|Immediate redirect — no<br>splash or "you are registered"<br>intermediate screen|



##### **J1.2 — Homepage Flow (W01)** 

###### **W01  Home** **<mark>p</mark> a** **<mark>g</mark> e** _nexaclip.com_ 

ZONE A — TopNav (fixed, 72px): Logo left · Features / Pricing / Blog links centre · "Log in" ghost + "Get started free" <mark>p</mark> rimar <mark>y</mark> buttons ri <mark>g</mark> ht. 

ZONE B — Hero (100vh min): Dark navy background. Left 7 cols: eyebrow pill, H1 headline (2 lines max), subtitle, 2 CTA buttons, social proof row. Right 5 cols: Live AI demo widget (card with real generation animation <mark>)</mark> . 

ZONE C — Social <mark>p</mark> roof bar <mark>(</mark> 80 <mark>p</mark> x <mark>)</mark> : Game <mark>p</mark> ublisher lo <mark>g</mark> os in <mark>g</mark> ra <mark>y</mark> scale. Mar <mark>q</mark> uee scroll on loo <mark>p</mark> . 

ZONE D — Feature cards (3-up): White cards on gray-50 background. Icon + title + 2-line description + "See how it works →" link each. 

ZONE E — Feature deep-dives (alternating): Image Studio (text left, product screenshot right). Creator Coach <mark>(</mark> screenshot left <mark>,</mark> text ri <mark>g</mark> ht with "Powered b <mark>y</mark> Claude AI" attribution <mark>)</mark> . 

ZONE F — Feed <mark>p</mark> review <mark>(</mark> full-width <mark>)</mark> : 6 real content cards from beta. "See what creators are makin <mark>g</mark> " headin <mark>g</mark> . ZONE G — Pricin <mark>g</mark> teaser: 2-column <mark>,</mark> Free <mark>p</mark> lan details left <mark>, p</mark> ricin <mark>g</mark> card <mark>p</mark> review ri <mark>g</mark> ht. CTA → / <mark>p</mark> ricin <mark>g</mark> . ZONE H — CTA band: Nav <mark>y</mark> -900 b <mark>g</mark> . Centred headline + 2 buttons. 

ZONE I — Footer: 4-column. Lo <mark>g</mark> o + links + co <mark>py</mark> ri <mark>g</mark> ht. 

##### **J1.3 — Signup Flow (W05) — Detailed Interaction Steps** 

|**#**|**Actor**|**What Happens On Screen**|**System / Backend Response**|**Browser / UI State**|
|---|---|---|---|---|
|**1**|**User**|Navigates to /signup via<br>homepage CTA or direct URL.|Serve signup page. Check if<br>user already has valid JWT —<br>if yes, redirect to /feed.|_Signup page loads._<br>_Centred 440px card on_<br>_gray-50 bg._|
|**2**|**System**|Form renders: Email input,<br>Username input, Password<br>input with strength indicator<br>bar. Google SSO button. Apple<br>SSO button. "Create account"<br>primary button (disabled until<br>form valid).|No backend call yet.|_Form default state._<br>_Button disabled (40%_<br>_opacity)._|
|**3**|**User**|Types email address in Email<br>field.|No call on every keystroke.<br>Validate format client-side<br>only.|_Email field: Default →_<br>_Filled. No error shown_<br>_until blur._|
|**4**|**User**|Clicks out of email field (blur).|POST /auth/check-email —<br>debounced 400ms after blur.|_If taken: red border +_<br>_"Email already_|



_Confidential  ·  For UI/UX Designer & Solution Architect  ·  March 2026  ·  Desktop Web App — v1.0_ 

7 

NexaClip  ·  Web Application UX Flow  ·  End-to-End Interaction Design 

|**#**|**Actor**|**What Happens On Screen**|**System / Backend Response**|**Browser / UI State**|
|---|---|---|---|---|
||||Checks if email is already<br>registered.|_registered. Log in →". If_<br>_available: no change_<br>_(silent pass)._|
|**5**|**User**|Types username. Sees real-<br>time availability check.|GET /auth/check-<br>username?username={val} —<br>debounced 600ms after each<br>keystroke.|_Loading: small spinner in_<br>_field right. Available:_<br>_green checkmark. Taken:_<br>_red X + "Username_<br>_taken". Rules note: "3–20_<br>_chars, letters, numbers,_<br>_underscore."_|
|**6**|**User**|Types password. Sees<br>strength bar below field<br>change in real time.|No backend call. Client-side<br>strength calculation only.|_Strength bar: red (weak)_<br>_→ amber (fair) → green_<br>_(strong). Requirement list_<br>_appears: 8+ chars, 1_<br>_number, 1 uppercase._<br>_Each checks off as met._|
|**7**|**User**|"Create account" button<br>activates once all fields valid.|No call yet.|_Button changes from_<br>_disabled (40% opacity) to_<br>_active (full purple, --_<br>_shadow-purple)._|
|**8**|**User**|Clicks "Create account" button.|POST /auth/register. Sends<br>email, username, password.<br>Returns: { accessToken,<br>refreshToken, user }.|_Button: "Creating your_<br>_account..." + spinner_<br>_replaces text. Button_<br>_disabled. No layout shift._|
|**9**|**System**|Account created. Non-blocking<br>email verification note: "We<br>sent a verification link to<br>{email}. You can verify later."|Stores tokens in localStorage<br>(nx_access_token,<br>nx_refresh_token). Stores user<br>in NgRx Signal Store. Fires<br>background call to Identity<br>Service to send verification<br>email.|_Brief success state on_<br>_button (green checkmark,_<br>_400ms) then immediate_<br>_navigation._|
|**10**|**System**|Redirects to /onboarding.|Angular Router navigates. No<br>page reload. Previous /signup<br>URL removed from history<br>(replaceUrl: true).|_Onboarding page loads._<br>_App shell NOT shown —_<br>_full screen modal-style_<br>_layout._|
|**J1.4**<br>**#**|**— Logi**<br>**Actor**|**n Flow (W04)**<br>**What Happens On Screen**|**System / Backend Response**|**Browser / UI State**|
|**1**|**User**|Arrives at /login. Centred<br>440px card. "Welcome back"<br>heading. Email + password<br>fields. "Sign in" primary button.<br>"Forgot password?" link. "No<br>account? Sign up →" link.|Serve page. Check JWT — if<br>valid redirect to /feed. If<br>nx_return_to in localStorage,<br>note it for post-login redirect.|_Login form default state._|
|**2**|**User**|Enters email and password.<br>Clicks "Sign in".|POST /auth/login. Returns<br>JWT + refresh token or 401<br>error.|_Button: "Signing in..." +_<br>_spinner._|
|**3**|**System**|Login successful.|Store tokens in localStorage.<br>Set user in NgRx store. Check<br>nx_return_to — navigate to<br>stored URL or /feed.|_Fade transition to_<br>_destination page._|



_Confidential  ·  For UI/UX Designer & Solution Architect  ·  March 2026  ·  Desktop Web App — v1.0_ 

8 

NexaClip  ·  Web Application UX Flow  ·  End-to-End Interaction Design 

|**#**|**Actor**|**What Happens On Screen**|**System / Backend Response**|**Browser / UI State**|
|---|---|---|---|---|
|**4**|**Error**|Wrong credentials: Red banner<br>above form: "Email or<br>password is incorrect." Both<br>fields shake animation<br>(200ms). Password field<br>cleared. Email field retains<br>value.|401 returned. Do not indicate<br>which field is wrong (security<br>best practice).|_Error state. User can_<br>_retry without retyping_<br>_email._|
|**5**|**Error**|Account locked (5 failed<br>attempts): "Too many<br>attempts. Your account is<br>temporarily locked. Try again<br>in 15 minutes or reset your<br>password."|429 returned with retry-after<br>header. Show countdown<br>timer.|_Sign in button disabled_<br>_with countdown._|



##### **J1.5 — Returning User Auto-Login** 

|**#**|**Actor**|**What Happens On Screen**|**System / Backend Response**|**Browser / UI State**|
|---|---|---|---|---|
|**1**|**User**|Navigates to nexaclip.com. No<br>login action needed.|Angular app initialises.<br>AuthService checks<br>localStorage for<br>nx_access_token. Decodes<br>JWT to check expiry.|_App loading (spinner or_<br>_skeleton for < 500ms)._|
|**2**|**System**|JWT is valid and not expired.|User loaded from JWT payload<br>into NgRx store. No network<br>call needed.|_Redirect to /feed_<br>_immediately. No login_<br>_page shown._|
|**3**|**System**|JWT is expired but refresh<br>token exists.|POST /auth/refresh with<br>refresh token. New access<br>token returned.|_Silent background_<br>_refresh. User never sees_<br>_login page._|
|**4**|**System**|Both tokens expired or absent.|Clear localStorage tokens.<br>Store current URL as<br>nx_return_to if it was an auth-<br>required page.|_Redirect to /login._|



_Confidential  ·  For UI/UX Designer & Solution Architect  ·  March 2026  ·  Desktop Web App — v1.0_ 

NexaClip  ·  Web Application UX Flow  ·  End-to-End Interaction Design 

9 

#### **Journey 2 — Claude Onboarding Chat** 

_First intelligent interaction  ·  90 seconds  ·  One-time only_ 

The onboarding chat is the most critical moment in the user lifecycle. It sets the tone for the entire product relationship. It must feel intelligent, fast, and personalised — not like a form with a conversational skin. It runs immediately after registration and never again. 

##### **J2.1 — Onboarding Screen Layout** 

###### **OB  Onboardin** **<mark>g</mark> Chat** _/onboarding_ 

FULL SCREEN — No a <mark>pp</mark> SideNav <mark>,</mark> no To <mark>p</mark> Bar. Sin <mark>g</mark> le focus on the conversation. 

TOP BAR (48px): NexaClip logo left. Progress indicator centre: 5 unfilled dots, first fills purple as user answers each <mark>q</mark> uestion. "Ski <mark>p</mark> for now" text link ri <mark>g</mark> ht <mark>(</mark> small <mark>, g</mark> ra <mark>y)</mark> . 

LEFT PANEL (40% width): Static panel. Large NexaClip logo/icon. "Your Creator Coach is setting up your account." subtitle. Below: 3 benefit bullets that appear one-by-one as questions progress. Dark navy back <mark>g</mark> round. Pur <mark>p</mark> le accent. 

RIGHT PANEL (60% width): Scrollable chat area. Claude messages (purple-50 bubbles, left-aligned). User answer bubbles <mark>(</mark> nav <mark>y</mark> -50 <mark>,</mark> ri <mark>g</mark> ht-ali <mark>g</mark> ned <mark>)</mark> . O <mark>p</mark> tion chi <mark>p</mark> s below each Claude <mark>q</mark> uestion. 

BOTTOM (right panel): Input area only visible after Q5 for free-form responses. Not shown during chip-selection <mark>p</mark> hases. 

CHIP OPTIONS AREA: Appears below the last Claude message. Full width of right panel. Chips arranged in a res <mark>p</mark> onsive <mark>g</mark> rid <mark>(</mark> 2-3 <mark>p</mark> er row <mark>)</mark> . Sta <mark>gg</mark> er-animate in from below <mark>(</mark> 80ms dela <mark>y</mark> each <mark>)</mark> . 

##### **J2.2 — Detailed Onboarding Flow** 

|**#**|**Actor**|**What Happens On Screen**|**System / Backend Response**|**Browser / UI State**|
|---|---|---|---|---|
|**1**|**System**|Onboarding page loads. Left<br>panel visible. Right panel<br>shows Claude typing indicator<br>(3 pulsing purple dots in a<br>bubble).|Angular initialises WebSocket<br>connection to Notification<br>Service (/events namespace).<br>POST /coach/onboarding/start<br>— returns opening message.|_Left panel visible. Chat_<br>_area: Claude typing_<br>_indicator active._|
|**2**|**Claude**|Opening message streams in<br>token by token: "Welcome to<br>NexaClip! I am your Creator<br>Coach. Let me set up your<br>account in about 90 seconds<br>— just answer 5 quick<br>questions." Message finishes.<br>Q1 chip options animate in<br>below.|Server-Sent Events stream<br>tokens via WebSocket<br>coach:token events. Angular<br>component appends each<br>token to the message string.|_Message text streams in._<br>_After complete, chips_<br>_animate: stagger 80ms_<br>_each._|
|**3**|**System**|Q1 chips appear: [Valorant]<br>[Fortnite] [CS2] [Apex<br>Legends] [FIFA] [Minecraft]<br>[Other]. Multi-select enabled.<br>"Continue →" button appears<br>after first selection.|No backend call on chip<br>display.|_Chips: default white_<br>_border. Multi-select_<br>_possible. Continue_<br>_button: disabled until ≥1_<br>_selected._|



_Confidential  ·  For UI/UX Designer & Solution Architect  ·  March 2026  ·  Desktop Web App — v1.0_ 

10 

NexaClip  ·  Web Application UX Flow  ·  End-to-End Interaction Design 

|**#**|**Actor**|**What Happens On Screen**|**System / Backend Response**|**Browser / UI State**|
|---|---|---|---|---|
|**4**|**User**|Clicks 1–3 game chips.<br>Selected chips turn purple-<br>filled. Clicks "Continue →".|No API call yet — selections<br>held client-side.|_Selected chips: purple bg_<br>_+ white text. Continue_<br>_button activates._|
|**5**|**System**|User answer appears as right-<br>aligned bubble: "Valorant,<br>Fortnite". Progress dot 1 fills<br>purple. Claude typing indicator<br>appears.|POST<br>/coach/onboarding/answer with<br>{ question: 1, answer:<br>[...selectedGames] }. System<br>begins building Q2 context.|_User bubble slides in_<br>_from right. Progress dot 1_<br>_→ filled purple._|
|**6**|**Claude**|Q2 message streams in: "Nice!<br>Who are you making content<br>for?" Q2 chips appear:<br>[Competitive players] [Casual<br>gaming fans] [General gaming<br>audience].|Claude API generates Q2<br>based on game choices for<br>personalisation. Single-select<br>this round.|_Q2 chips animate in._<br>_Single-select: clicking_<br>_one automatically_<br>_continues (no Continue_<br>_button needed)._|
|**7**|**User**|Clicks one audience option.<br>Auto-submits.|POST<br>/coach/onboarding/answer with<br>{ question: 2, answer:<br>selectedAudience }. Progress<br>dot 2 fills.|_Selected chip_<br>_immediately becomes_<br>_user bubble and submits._<br>_No delay — feels_<br>_responsive._|
|**8**|**Claude**|Q3: "What is your main goal?"<br>Chips: [Grow followers fast]<br>[Build a loyal community]<br>[Attract brand deals].|Auto-submit continues for<br>single-select questions.|_Same pattern. Progress_<br>_dot 3 fills on answer._|
|**9**|**Claude**|Q4: "How often can you<br>realistically post?" Chips: [1–2<br>times per week] [3–5 times per<br>week] [Daily].|Auto-submit on click.|_Progress dot 4 fills._|
|**10**|**Claude**|Q5: "Do you have existing<br>gaming clips or are you<br>starting from scratch?"<br>Options: [I have clips ready]<br>[Starting fresh].|Auto-submit on click. After<br>answer received, POST<br>/coach/onboarding/generate-<br>plan with all 5 answers.|_Progress dot 5 fills. All 5_<br>_dots now purple._|
|**11**|**System**|Plan generation state: Claude<br>typing indicator returns. Left<br>panel updates: "Building your<br>personalised plan..." with<br>animated pulse.|Claude API generates 7-day<br>plan JSON. ~3–6 seconds.<br>WebSocket streams progress:<br>"Analysing your game niche..."<br>then "Creating your week<br>plan...".|_Animated pulse on left_<br>_panel text. Right panel:_<br>_extended typing_<br>_indicator._|
|**12**|**Claude**|Plan reveal: "Your first week is<br>ready! Here is what I have<br>planned for you:" followed by a<br>structured 7-day preview<br>(Mon–Sun cards in a 2-column<br>grid within the chat panel).|Plan JSON stored to<br>users.onboarding_plan in<br>PostgreSQL.<br>Users.onboarding_completed<br>= true.|_Plan cards animate in_<br>_with stagger. Day cards:_<br>_icon + day + content type_<br>_+ one-line theme._|
|**13**|**System**|"Let's go →" primary button<br>appears below plan. "Explore<br>on my own" ghost link.|No call on button render.|_Button pulses subtly to_<br>_draw attention (CSS_<br>_keyframe animation,_<br>_gentle scale_<br>_1.0→1.02→1.0)._|
|**14**|**User**|Clicks "Let's go →".|Angular Router navigates to<br>/create with query param<br>?onboarded=true.|_Fade transition to Create_<br>_Hub. Welcome banner at_<br>_top of Create Hub._|



_Confidential  ·  For UI/UX Designer & Solution Architect  ·  March 2026  ·  Desktop Web App — v1.0_ 

NexaClip  ·  Web Application UX Flow  ·  End-to-End Interaction Design 

11 

##### **J2.3 — Onboarding Error States** 

###### **Error Error** 

Claude API timeout (>15s): "This is taking longer than usual. Your answers are saved — tap Retry." Retry resubmits from last answered question. 

Network lost mid-chat: "You are offline — your progress is saved. Reconnect to continue." All chip answers preserved in sessionStorage. 

###### **Default** 

User clicks "Skip for now": Taken to /feed immediately. Persistent banner at top of every page: "Complete your setup for a personalised experience →" 

###### **Default** 

User refreshes midonboarding: If answers stored in sessionStorage, resume from last answered question. If not, restart from Q1 (progress is fast enough this is acce <mark>p</mark> table <mark>)</mark> . 

_Confidential  ·  For UI/UX Designer & Solution Architect  ·  March 2026  ·  Desktop Web App — v1.0_ 

NexaClip  ·  Web Application UX Flow  ·  End-to-End Interaction Design 

12 

#### **Journey 3 — Image & Meme Creation** 

_Prompt → AI image → caption → publish  ·  2–3 minutes_ 

Image creation is the highest-frequency feature and the most important upgrade trigger. The flow must deliver a result that surprises and delights within 8 seconds of clicking Generate. Free users must feel the product working before they hit any paywall. 

##### **J3.1 — Image Studio Screen Layout** 

###### **A03  Ima** **<mark>g</mark> e & Meme Studio** _/create/image_ 

LAYOUT: Two-column <mark>p</mark> ersistent s <mark>p</mark> lit. Left 55% <mark>,</mark> Ri <mark>g</mark> ht 45%. Both <mark>p</mark> anels sta <mark>y</mark> fixed — no scroll hides either. LEFT PANEL — INPUT: 

Breadcrumb: Create → Ima <mark>g</mark> e Studio. 

Section label: "Describe <mark>y</mark> our ima <mark>g</mark> e" <mark>(</mark> label-l <mark>g, g</mark> ra <mark>y)</mark> . 

Prompt Textarea: 5 rows min, 8 rows max, auto-expand. Rotating placeholder every 4 seconds. Character counter bottom-ri <mark>g</mark> ht <mark>(</mark> 0/500 <mark>)</mark> . Pur <mark>p</mark> le focus rin <mark>g</mark> . 

Style Picker: "Style" label. 5 horizontal cards: Cinematic / Meme / Pixel Art / Cartoon / Realistic. Icon + label. One alwa <mark>y</mark> s selected. Selected: <mark>p</mark> ur <mark>p</mark> le border <mark>(</mark> 2 <mark>p</mark> x <mark>)</mark> + <mark>p</mark> ur <mark>p</mark> le-50 fill. 

Free tier counter: "3 of 5 <mark>g</mark> enerations left toda <mark>y</mark> · Resets at midni <mark>g</mark> ht". Pro <mark>g</mark> ress dots. Amber if 1–2 left <mark>,</mark> red if 0. Generate Button: Full-width, 48px, primary purple. "✨ Generate Image". Disabled when prompt empty. Loadin <mark>g</mark> state on click. 

RIGHT PANEL — RESULT: 

Empty state (on first load): Dashed border card. Sparkle icon 40px. "Your image will appear here" gray text. Matches the <mark>p</mark> anel dimensions exactl <mark>y</mark> . 

Loadin <mark>g</mark> state: Skeleton card + shimmer animation. "Generatin <mark>g y</mark> our ima <mark>g</mark> e..." text below. Result: Generated image fills panel. --radius-xl. AI badge top-left corner. Watermark for free users (semitrans <mark>p</mark> arent lo <mark>g</mark> o <mark>,</mark> bottom-ri <mark>g</mark> ht <mark>,</mark> 30% o <mark>p</mark> acit <mark>y)</mark> . 

Caption section (loads 0.5s after image): Three option cards (selectable). Editable textarea below selected ca <mark>p</mark> tion. Character counter. Platform limit bad <mark>g</mark> es. 

Hashta <mark>g</mark> section: Three bundles <mark>(</mark> Short/Medium/Lon <mark>g)</mark> . Active bundle shows removable chi <mark>p</mark> s. Action bar <mark>(</mark> stick <mark>y</mark> at <mark>p</mark> anel bottom <mark>)</mark> : "Download" <mark>g</mark> host button left. "Publish to Feed" <mark>p</mark> rimar <mark>y</mark> button ri <mark>g</mark> ht. 

##### **J3.2 — Image Generation Flow** 

|**#**|**Actor**|**What Happens On Screen**|**System / Backend Response**|**Browser / UI State**|
|---|---|---|---|---|
|**1**|**User**|Opens /create/image from<br>Create Hub or direct nav. Left<br>panel loaded with prompt input<br>focused (auto-focus). Right<br>panel shows empty state card.|GET /create/image page. Load<br>user plan data and daily usage<br>count from JWT payload.|_Left panel active. Cursor_<br>_in textarea. Right panel:_<br>_empty state dashed card._|
|**2**|**User**|Types prompt: "A Valorant Jett<br>agent standing on a Moroccan<br>rooftop at golden hour,<br>cinematic photography". Style<br>"Cinematic" already selected.|No API call during typing.|_Character counter_<br>_increments: "89/500"._<br>_Generate button_<br>_activates when text > 0._|



_Confidential  ·  For UI/UX Designer & Solution Architect  ·  March 2026  ·  Desktop Web App — v1.0_ 

13 

NexaClip  ·  Web Application UX Flow  ·  End-to-End Interaction Design 

|**#**|**Actor**|**What Happens On Screen**|**System / Backend Response**|**Browser / UI State**|
|---|---|---|---|---|
|**3**|**User**|Clicks "✨Generate Image".|Validate: prompt not empty,<br>daily limit not exceeded (check<br>Redis key<br>rate:{userId}:image_gen:{date}).<br>If valid: POST<br>/content/generate.|_Button text →_<br>_"Generating..." + spinner._<br>_Button disabled. Right_<br>_panel: empty state fades_<br>_out (200ms), skeleton_<br>_card fades in._|
|**4**|**System**|Right panel shows animated<br>skeleton with shimmer.<br>"Generating your image... (~6<br>seconds)" counter below<br>skeleton.|DALL-E 3 API call with style-<br>prefixed prompt. Expected<br>response time: 4–12 seconds.|_Skeleton shimmer_<br>_animation loops. Counter_<br>_counts up seconds._|
|**5**|**System**|Image arrives. Skeleton fades<br>out (150ms). Generated image<br>fades in (300ms + translateY<br>8px→0px). AI badge appears<br>top-left. Watermark visible for<br>free users.|Image downloaded from DALL-<br>E URL, watermarked if free tier,<br>uploaded to S3, CDN URL<br>returned. Caption generation<br>begins simultaneously (GPT-4o<br>mini, async ~1s).|_Image visible. Button text_<br>_resets to "_✨_Generate_<br>_Image". Button re-_<br>_enables._|
|**6**|**System**|Caption section slides in below<br>image (~1 second after<br>image). "Suggested captions"<br>heading. 3 option cards<br>appear with stagger animation.|GPT-4o mini returns 3 caption<br>variants + 3 hashtag sets.<br>Stored in content record.|_Caption cards animate in_<br>_(stagger 100ms). First_<br>_card auto-selected_<br>_(purple border)._|
|**7**|**User**|Reviews captions. Clicks<br>caption card 2 to select it.|No API call — client-side<br>selection.|_Card 2 gets purple_<br>_border + purple-50 fill._<br>_Card 1 deselects._<br>_Selected text copies into_<br>_editable textarea below._|
|**8**|**User**|Edits caption text in textarea.<br>Selects "Medium" hashtag<br>bundle.|No API call during editing.|_Character counter_<br>_updates. Hashtag chips_<br>_render below. Platform_<br>_limit badge:_<br>_green/amber/red based_<br>_on platform char limits._|
|**9**|**User**|Clicks "Publish to Feed".|POST<br>/content/{contentId}/publish.<br>Triggers moderation worker<br>(HIGH priority BullMQ queue).|_Button: "Publishing..." +_<br>_spinner. Brief overlay on_<br>_image: "Reviewing_<br>_content..." (if moderation_<br>_>2s)._|
|**10**|**System**|Moderation approved (<3s).<br>Success state: brief green<br>flash on Publish button<br>(200ms). Toast notification<br>slides in from top-right: "Your<br>image is live! View on feed<br>→".|Content status → published.<br>Feed Service notified. Analytics<br>event logged.|_Toast: "Your image is_<br>_live!" with teal-700 bg,_<br>_View link, 4s auto-_<br>_dismiss._|
|**11**|**User**|Clicks "View on feed →" in<br>toast. OR stays to create<br>another image (prompt field<br>retained).|Angular Router navigates to<br>/feed if user clicks toast link.|_If stays: right panel_<br>_resets to empty state._<br>_Prompt field retains last_<br>_prompt. Generate button_<br>_re-enabled._|



##### **J3.3 — Daily Limit Reached Flow (Free User)** 

_Confidential  ·  For UI/UX Designer & Solution Architect  ·  March 2026  ·  Desktop Web App — v1.0_ 

14 

NexaClip  ·  Web Application UX Flow  ·  End-to-End Interaction Design 

|**#**|**Actor**|**What Happens On Screen**|**System / Backend Response**|**Browser / UI State**|
|---|---|---|---|---|
|**1**|**User**|Clicks "✨Generate Image"<br>after using all 5 daily free<br>generations.|POST /content/generate<br>returns 403 with body: {<br>message: "Daily limit reached",<br>limit: 5, upgrade_url:<br>"/upgrade" }.|_Generate button shows_<br>_brief error state._|
|**2**|**System**|Upgrade modal slides up from<br>bottom of screen (not full page<br>redirect). Modal shows: the last<br>generated image (proof of<br>value already received) + "You<br>have created 5 images today<br>— you are on a roll." + Pro<br>benefits list + "$12/month"<br>pricing + "Unlock unlimited →"<br>CTA + "Maybe later" link.|No backend call for modal<br>display.|_Page dims. Modal slides_<br>_up (350ms spring_<br>_animation). Backdrop_<br>_overlay behind modal._|
|**3**|**User**|User clicks "Maybe later".<br>Modal dismisses. Counter now<br>shows "0 generations left ·<br>Resets at midnight".|No call.|_Modal slides down._<br>_Counter badge turns red._<br>_Generate button remains_<br>_disabled with tooltip on_<br>_hover: "Daily limit_<br>_reached. Resets at_<br>_midnight."_|
|**4**|**User**|User clicks "Unlock unlimited<br>→". Navigates to /upgrade or<br>Stripe checkout.|POST /billing/create-checkout<br>returns Stripe checkout URL.|_Redirect to Stripe_<br>_checkout in same tab_<br>_(not new tab — prevents_<br>_popup blocker)._|



##### **J3.4 — Image Generation Error States** 

**Error Error Error Loading** DALL-E API timeout Content rejected by "Refine" flow: "Not what Slow connection: If (>20s): "Your image is moderation: Red overlay you wanted? Refine it" link generation >10s, "Still taking longer than usual. on generated image. "We always visible below working on your image..." We will notify you when it could not publish this. image. Opens an overlay text replaces the is ready." User can leave [Plain English reason]. with the original prompt countdown. At 20s: offer — push notification fires Edit your prompt and try pre-filled + "What to to complete in background when complete. again." Prompt pre-filled change" description field. with notification. with previous text. One-tap regeneration with refinement context. 

_Confidential  ·  For UI/UX Designer & Solution Architect  ·  March 2026  ·  Desktop Web App — v1.0_ 

NexaClip  ·  Web Application UX Flow  ·  End-to-End Interaction Design 

15 

#### **Journey 4 — Gaming Clip Upload & Editing** 

_Upload → Trim → AI Polish → Publish  ·  5–8 minutes_ 

The clip editor is the most technically complex flow in the product. It involves a large file upload, video playback, timeline interaction, and AI processing pipeline. The UX must manage waiting time with clear progress communication and make the AI polish feel like magic rather than a loading screen. 

##### **J4.1 — Three-Step Wizard Structure** 

|**Step**|**Screen**|**URL**|**What Happens**|
|---|---|---|---|
|Step 1:<br>Upload|Clip Upload (A04a)|/create/clip|User selects video file. Direct<br>S3 upload with XHR progress.<br>Navigates to editor when<br>upload complete.|
|Step 2: Trim|Clip Editor — Trim<br>(A04b)|/create/clip/:id/edit?step=trim|User defines highlight window<br>on filmstrip timeline. Sets trim<br>handles. Previews selection.|
|Step 3:<br>Polish &<br>Publish|Clip Editor — Polish<br>(A04b)|/create/clip/:id/edit?step=polish|Whisper transcription. Caption<br>editing. Music selection. Final<br>publish.|



##### **J4.2 — Upload Flow (Step 1)** 

|**#**|**Actor**|**What Happens On Screen**|**System / Backend Response**|**Browser / UI State**|
|---|---|---|---|---|
|**1**|**User**|Clicks "Gaming Clip" from<br>Create Hub. Navigates to<br>/create/clip. Upload zone:<br>large dashed-border area<br>(320px height). "Drop your<br>gaming clip here" with upload<br>icon. "or click to browse"<br>below. File format and size<br>limits shown.|GET /create/clip page. No<br>API call yet.|_Upload zone in default state._|
|**2**|**User**|Drags a video file onto the<br>drop zone or clicks "Browse"<br>and selects from file picker.|No call yet. Client-side<br>validation: check file<br>extension (mp4/mov/avi) and<br>file size (500MB free / 5GB<br>Pro).|_On valid drag-over: dashed_<br>_border turns solid purple, bg_<br>_turns purple-50. On drop:_<br>_validation runs._|
|**3**|**System**|File validation passes.<br>Upload zone transforms:<br>shows filename, file size,<br>progress bar (12px height),<br>"Uploading... 0%" +<br>estimated time, "Cancel" link.|POST /content/upload-url —<br>returns pre-signed S3 URL +<br>contentId. Then XHR PUT to<br>S3 URL directly from<br>browser.|_Progress bar fills in real time_<br>_based on XHR progress_<br>_events._|
|**4**|**System**|Upload completes (progress<br>bar reaches 100%). Brief<br>"Upload complete✓" state|S3 Lambda notifies Content<br>Service: upload complete.<br>Content record status →<br>"uploaded". Frame thumbnail<br>extraction job begins.|_Progress bar fills green._<br>_Checkmark. Then fade_<br>_transition to_<br>_/create/clip/:id/edit?step=trim._|



_Confidential  ·  For UI/UX Designer & Solution Architect  ·  March 2026  ·  Desktop Web App — v1.0_ 

NexaClip  ·  Web Application UX Flow  ·  End-to-End Interaction Design 

16 

|**#**|**Actor**|**What Happens On Screen**|**System / Backend Response**|**Browser / UI State**|
|---|---|---|---|---|
|||(green check, 600ms). Auto-<br>navigates to trim editor.|||
|**5**|**Error**|File too large (free tier): Inline<br>message below upload zone:<br>"This file is 1.8GB — free<br>accounts support up to<br>500MB. Trim the recording<br>first, or upgrade to Pro for up<br>to 5GB." Upgrade link inline.|Client-side check — no<br>upload attempted.|_Upload zone shows error_<br>_state (red dashed border)._<br>_Message below._|
|**6**|**Error**|Upload interrupted (network):<br>"Upload interrupted. Tap<br>Retry to resume where you<br>left off." Retry uses S3<br>multipart upload resume from<br>last committed part.|Multipart upload metadata<br>stored server-side. Resume<br>continues from last<br>successful part.|_Progress bar freezes. Error_<br>_banner above progress bar._<br>_Retry button appears._|



##### **J4.3 — Trim Editor Flow (Step 2)** 

###### **A04b  Cli** **<mark>p</mark> Trim Editor** _/create/clip/:id/edit?step=trim_ 

STEP INDICATOR: Horizontal 3-step bar at page top. Step 1 (Upload): completed checkmark. Step 2 (Trim): active/ <mark>p</mark> ur <mark>p</mark> le. Ste <mark>p</mark> 3 <mark>(</mark> Polish <mark>)</mark> : u <mark>p</mark> comin <mark>g</mark> / <mark>g</mark> ra <mark>y</mark> . VIDEO PLAYER: 16:9 ratio. Fills content area max-width minus padding. Standard controls: <mark>p</mark> la <mark>y</mark> / <mark>p</mark> ause/mute/volume/fullscreen. Pla <mark>y</mark> s onl <mark>y</mark> within trim selection durin <mark>g</mark> trim mode. TIMELINE STRIP <mark>(</mark> below video <mark>,</mark> full content width <mark>,</mark> 72 <mark>p</mark> x hei <mark>g</mark> ht <mark>)</mark> : Frame thumbnails: horizontal filmstri <mark>p</mark> of extracted frames <mark>(p</mark> ro <mark>g</mark> ressive load from left <mark>)</mark> . Left trim handle: oran <mark>g</mark> e <mark>p</mark> ill <mark>(</mark> 16 <mark>p</mark> x wide <mark>,</mark> full hei <mark>g</mark> ht <mark>)</mark> . Dra <mark>g</mark> to set cli <mark>p</mark> start. Ri <mark>g</mark> ht trim handle: same. Dra <mark>g</mark> to set cli <mark>p</mark> end. Pur <mark>p</mark> le overla <mark>y</mark> : between handles at 30% o <mark>p</mark> acit <mark>y</mark> shows selected re <mark>g</mark> ion. Pla <mark>y</mark> head: thin <mark>p</mark> ur <mark>p</mark> le vertical line + 12 <mark>p</mark> x circle to <mark>p</mark> . Dra <mark>gg</mark> able. Time markers: ever <mark>y</mark> 10 seconds below stri <mark>p</mark> . TRIM CONTROLS ROW <mark>(</mark> below timeline <mark>)</mark> : Left: "Start time" editable in <mark>p</mark> ut <mark>(</mark> e. <mark>g</mark> . 0:14 <mark>)</mark> . "End time" editable in <mark>p</mark> ut <mark>(</mark> e. <mark>g</mark> . 0:37 <mark>)</mark> . Centre: "Duration: 0:23" bad <mark>g</mark> e. U <mark>p</mark> dates in real time. Ri <mark>g</mark> ht: "Preview selection" button. "A <mark>pp</mark> l <mark>y</mark> Trim & Continue →" <mark>p</mark> rimar <mark>y</mark> button. DURATION LIMIT: Free: "0:23 / 1:30 max" shown in bad <mark>g</mark> e. Pro: "0:23 / 3:00 max". 

|**#**|**Actor**|**What Happens On Screen**|**System / Backend Response**|**Browser / UI State**|
|---|---|---|---|---|
|**7**|**System**|Trim editor loads. Video player<br>shows first frame. Timeline<br>strip begins rendering frame<br>thumbnails from left<br>(progressive). Frame<br>thumbnails appear as they<br>load.|Frame thumbnails extracted<br>every 2 seconds by FFmpeg<br>worker. CDN URLs returned<br>progressively.|_Timeline: skeleton_<br>_thumbnails → real frames_<br>_appearing left to right._|
|**8**|**User**|Drags left trim handle to set<br>start point. Video jumps to that<br>timestamp. Duration badge<br>updates.|No API call. Client-side only.|_Handle position updates._<br>_Selection overlay_<br>_redraws. Duration badge:_<br>_real-time update._|



_Confidential  ·  For UI/UX Designer & Solution Architect  ·  March 2026  ·  Desktop Web App — v1.0_ 

17 

NexaClip  ·  Web Application UX Flow  ·  End-to-End Interaction Design 

|**#**|**Actor**|**What Happens On Screen**|**System / Backend Response**|**Browser / UI State**|
|---|---|---|---|---|
|**9**|**User**|Drags right trim handle to set<br>end point. Duration badge<br>shows final selection.|No call.|_Selection region between_<br>_handles highlighted._<br>_Duration badge: "0:28"._|
|**10**|**User**|Clicks "Preview selection".<br>Video plays from trim start to<br>trim end only. Looping.|No call. HTML video element<br>currentTime set to trim start.<br>playbackRate 1x.|_Video plays within_<br>_selection bounds. "Stop_<br>_preview" button replaces_<br>_play button._|
|**11**|**User**|Satisfied with selection. Clicks<br>"Apply Trim & Continue →".|PATCH /content/:id/trim — {<br>trimStart: 14.2, trimEnd: 42.6 }.<br>Content record updated.<br>Dispatch transcription job to<br>BullMQ.|_Button: "Saving..." +_<br>_spinner (500ms). Then_<br>_fade transition to polish_<br>_step._|



##### **J4.4 — AI Polish & Publish Flow (Step 3)** 

|**#**|**Actor**|**What Happens On Screen**|**System / Backend Response**|**Browser / UI State**|
|---|---|---|---|---|
|**12**|**System**|Polish step loads. Left panel:<br>"Polishing your clip" heading.<br>3-step progress list with<br>animated icons. Right panel:<br>empty preview placeholder.|BullMQ transcription worker<br>picks up job. Whisper API call<br>begins.|_Step 1 (Transcribing):_<br>_spinner icon + "Finding_<br>_the words in your clip..."_|
|**13**|**System**|Step 1 completes: checkmark<br>replaces spinner on step 1.<br>Step 2 activates.|Whisper returns timestamped<br>transcript. VTT caption file<br>generated. Stored to S3.|_Step 1: green checkmark._<br>_Step 2: spinner + "Adding_<br>_captions to your clip..."_|
|**14**|**System**|Step 2 completes. Step 3<br>activates.|Caption file stored. Peak audio<br>timing analysed. Music library<br>matched to content genre.|_Step 2: green checkmark._<br>_Step 3: spinner +_<br>_"Matching effects..."_|
|**15**|**System**|All 3 steps complete. "Polish<br>complete!" heading replaces<br>progress list. Results slide up<br>into left panel.|Content status →<br>"ready_to_publish".<br>WebSocket emits<br>content:status update.|_Results section: captions_<br>_list, effects toggle, music_<br>_carousel._|
|**16**|**User**|Reviews captions list<br>(transcript lines with<br>timestamps). Taps a caption<br>line to edit it inline.|No API call during edit.|_Clicked line: text_<br>_becomes editable input._<br>_Blue border. Save on blur_<br>_or Enter._|
|**17**|**User**|Browses music carousel: 10<br>tracks shown with genre tags.<br>Clicks play icon on a track.|No API call. HTML Audio<br>element plays 15-second<br>preview from S3.|_Track preview plays. Play_<br>_→ pause button. Track_<br>_row highlighted._|
|**18**|**User**|Clicks "Use This Track". Music<br>selection confirmed.|PATCH /content/:id/music — {<br>musicTrackId }.|_Music badge appears on_<br>_right panel preview._|
|**19**|**User**|Clicks "Preview" on right panel.<br>Full video preview with<br>captions overlaid.|No API call. Constructed client-<br>side from clip CDN URL + VTT<br>file.|_Preview plays. Captions_<br>_render using HTML5_<br>_<track> element._|
|**20**|**User**|Enters clip title (required).<br>Optional description.|No API call on typing.|_Character counters_<br>_update. Title: 80 char_<br>_max. Description: 300_<br>_char max._|
|**21**|**User**|Clicks "Publish to Feed".|POST /content/:id/publish.<br>Moderation check queued.|_Button: "Publishing..." +_<br>_spinner._|



_Confidential  ·  For UI/UX Designer & Solution Architect  ·  March 2026  ·  Desktop Web App — v1.0_ 

NexaClip  ·  Web Application UX Flow  ·  End-to-End Interaction Design 

18 

|**#**|**Actor**|**What Happens On Screen**|**System / Backend Response**|**Browser / UI State**|
|---|---|---|---|---|
|**22**|**System**|Moderation approved. "Your<br>clip is live!🎉" full-width<br>success banner. Confetti<br>animation from clip thumbnail.|Content published.<br>MediaConvert final transcode<br>job queued for HLS streaming.|_Confetti burst (CSS,_<br>_1.2s). Success banner._<br>_Links: "View on Feed",_<br>_"Create Another"._|



_Confidential  ·  For UI/UX Designer & Solution Architect  ·  March 2026  ·  Desktop Web App — v1.0_ 

NexaClip  ·  Web Application UX Flow  ·  End-to-End Interaction Design 

19 

#### **Journey 5 — Social Feed & Engagement** 

_Daily content consumption and community interaction_ 

##### **J5.1 — Home Feed Layout & Initial Load** 

###### **A01  Home Feed** _/feed_ 

APP SHELL: SideNav (240px left, collapsible). TopBar (64px top, extends right of nav). Content area fills remainin <mark>g</mark> view <mark>p</mark> ort. 

FEED HEADER (sticky below TopBar): "Home" H2 left. "Following / Discover" toggle tabs right. "✨ Create" <mark>p</mark> rimar <mark>y</mark> button far ri <mark>g</mark> ht. 

TWO-COLUMN LAYOUT: Left 8 cols <mark>(</mark> feed <mark>)</mark> . Ri <mark>g</mark> ht 4 cols <mark>(</mark> sidebar wid <mark>g</mark> ets <mark>)</mark> . 

LEFT — CONTENT FEED: Masonry-style 2-column card grid. Each ContentCard: 16:9 thumbnail, user info row (avatar + username + game badge + time), caption (2 lines), engagement row (heart + count, comment + count, share <mark>,</mark> bookmark <mark>)</mark> . 

###### RIGHT — SIDEBAR WIDGETS: 

Widget 1: "Trending Today" — today's trend brief from Claude. Game icon + 1-sentence insight + "Create from this →" button. 

Widget 2: "Your Stats (7 days)" — 3 stat pills: Views, Likes, Shares. "Full report →" for Pro / "Unlock insights →" for free. 

Wid <mark>g</mark> et 3: "Su <mark>gg</mark> ested Creators" — 4 rows: avatar + name + <mark>g</mark> ame bad <mark>g</mark> e + "Follow" button. 

Wid <mark>g</mark> et 4 <mark>(</mark> free users onl <mark>y)</mark> : U <mark>pg</mark> rade nud <mark>g</mark> e card — "Creator Coach is waitin <mark>g</mark> for <mark>y</mark> ou. U <mark>pg</mark> rade to Pro →". 

##### **J5.2 — Feed Load & Scroll Flow** 

|**#**|**Actor**|**What Happens On Screen**|**System / Backend Response**|**Browser / UI State**|
|---|---|---|---|---|
|**1**|**User**|Navigates to /feed or clicks<br>Home in SideNav.|GET /feed?limit=20. Check<br>follows count. <5 follows:<br>discovery feed. 5+ follows:<br>personal feed.|_Feed skeleton: 4_<br>_ContentCard skeletons_<br>_(2×2) visible. Sidebar_<br>_widgets load in parallel._|
|**2**|**System**|First 20 posts load. Skeleton<br>cards replaced by real content<br>cards with stagger animation<br>(50ms delay per card).|Posts hydrated: content data +<br>user info + engagement counts<br>+ is_liked_by_me check.|_Cards snap into view_<br>_sequentially. Feed feels_<br>_alive._|
|**3**|**User**|Scrolls down the feed. Reads<br>content, watches clips.|When user reaches post 15 of<br>20: prefetch next 20 posts in<br>background (GET<br>/feed?cursor={id}).|_No loading indicator_<br>_during prefetch._<br>_Seamless infinite scroll._|
|**4**|**System**|Next 20 posts silently<br>appended below existing<br>cards. User never sees a load<br>break.|Response appended to<br>existing posts array in NgRx<br>store.|_Feed continues smoothly._<br>_No visual interruption._|
|**5**|**User**|Clicks on a video clip<br>thumbnail.|Navigate to /feed/post/:id. Load<br>full post data.|_Slide transition (post_<br>_detail slides in from right,_<br>_feed remains behind)._<br>_Video auto-plays muted._|



_Confidential  ·  For UI/UX Designer & Solution Architect  ·  March 2026  ·  Desktop Web App — v1.0_ 

20 

NexaClip  ·  Web Application UX Flow  ·  End-to-End Interaction Design 

|**#**|**Actor**|**What Happens On Screen**|**System / Backend Response**|**Browser / UI State**|
|---|---|---|---|---|
|**6**|**User**|Scrolls back to top and pulls<br>down (overscroll on desktop:<br>scrolls to negative position).|GET /feed?limit=20 (fresh<br>fetch).|_Pull-to-refresh indicator_<br>_appears at top. New_<br>_posts prepended with "3_<br>_new posts" badge._|



##### **J5.3 — Engagement Interactions** 

|**#**|**Actor**|**What Happens On Screen**|**System / Backend Response**|**Browser / UI State**|
|---|---|---|---|---|
|**7**|**User**|Clicks heart icon on a post.|POST /content/:id/like — toggles like.<br>Optimistic update: do not wait for<br>response.|_Heart: fills_<br>_immediately (purple)_<br>_+ count increments_<br>_by 1. Bounce_<br>_animation (scale_<br>_1→1.3→1.0). If_<br>_already liked: unfills,_<br>_count decrements._|
|**8**|**System**|Server confirms like toggle.|Like recorded in content_likes table.<br>content_engagement_counts updated.<br>Redis counter incremented.|_No visible change_<br>_(optimistic was_<br>_correct). On server_<br>_error: heart reverts_<br>_and toast: "Could not_<br>_save your like._<br>_Please try again."_|
|**9**|**User**|Clicks comment icon.<br>Comment panel slides out<br>from right side of the post<br>(within the post detail<br>view). Existing comments<br>listed.|GET /content/:id/comments?limit=20.|_Comment panel:_<br>_comments load with_<br>_skeleton → content._<br>_Input field at bottom_<br>_with Send button._|
|**10**|**User**|Types comment in input<br>field. Clicks "Send".|POST /content/:id/comment — { body:<br>text }.|_Comment appears_<br>_immediately at top of_<br>_comments list_<br>_(optimistic). Send_<br>_button: spinner during_<br>_call._|
|**11**|**User**|Clicks "Follow" button on a<br>post's creator avatar.|POST /users/:id/follow.|_"Follow" →_<br>_"Following_✓_"_<br>_immediately_<br>_(optimistic). Button:_<br>_white border → teal_<br>_fill. Reverting shows_<br>_"Follow" again._|
|**12**|**User**|Clicks share icon. Native<br>browser share sheet opens<br>(navigator.share()). If not<br>supported: clipboard copy<br>fallback.|Generate shareable link with UTM<br>params:<br>nexaclip.com/p/{contentId}?ref={userId}.|_On share: "Link_<br>_copied!" toast (2s)._<br>_On native share: OS_<br>_native sheet opens._|



##### **J5.4 — Empty Feed & Discovery** 

|**Empty**|**Empty**|**Loading**|**Error**|
|---|---|---|---|



_Confidential  ·  For UI/UX Designer & Solution Architect  ·  March 2026  ·  Desktop Web App — v1.0_ 

NexaClip  ·  Web Application UX Flow  ·  End-to-End Interaction Design 

21 

New user (0 follows): Show discovery feed automatically. "Suggested Creators" card appears at position 4 in feed. Teamcurated content fills feed. 

User follows creators with Initial feed load: 4 Feed load fails: "Could not no posts: "Nothing new skeleton ContentCards (2load your feed. Check from your follows. Here is column, matching card your connection and try what is trending →" with dimensions exactly). again." Retry button. Last CTA to discover tab. Sidebar: 3 widget cached feed shown below skeletons. <mark>(</mark> if available <mark>)</mark> . 

_Confidential  ·  For UI/UX Designer & Solution Architect  ·  March 2026  ·  Desktop Web App — v1.0_ 

NexaClip  ·  Web Application UX Flow  ·  End-to-End Interaction Design 

22 

#### **Journey 6 — User Profile Management** 

_Viewing, editing, and managing creator profiles_ 

##### **J6.1 — Own Profile View (A09)** 

###### **A09  Own Profile** _/profile_ 

COVER IMAGE: Full-width 1200×280px. Default: gradient using game niche colors. Upload button appears on hover <mark>(</mark> edit mode <mark>)</mark> . 

PROFILE HEADER: Avatar (88px circle) overlaps cover bottom-left (offset -24px). Display name (H2). Username <mark>(@</mark> handle <mark>, g</mark> ra <mark>y)</mark> . Plan bad <mark>g</mark> e <mark>(</mark> FREE/PRO/STUDIO <mark>p</mark> ill <mark>)</mark> . Edit Profile button to <mark>p</mark> -ri <mark>g</mark> ht. 

STATS ROW: 3 stat pills: Posts (count) · Followers (count, tappable → follower list) · Following (count, tappable → followin <mark>g</mark> list <mark>)</mark> . En <mark>g</mark> a <mark>g</mark> ement rate <mark>(</mark> Pro onl <mark>y,</mark> else locked icon <mark>)</mark> . 

GAME NICHE CHIPS: Horizontal chi <mark>p</mark> row showin <mark>g</mark> selected <mark>g</mark> ames. Teal outline chi <mark>p</mark> s. 

BIO: 1–3 lines. "Add a bio →" link if em <mark>p</mark> t <mark>y</mark> . 

CONTENT GRID: 3-column grid of ContentCard thumbnails. Sticky tab bar: Posts | Liked. "Create your first post →" em <mark>p</mark> t <mark>y</mark> state if no content. 

COMPLETION BANNER (if onboarding incomplete): Amber-50 bg. "Complete your setup for personalised recommendations" + "Finish setu <mark>p</mark> →" link. 

##### **J6.2 — Edit Profile Flow (A10)** 

|**#**|**Actor**|**What Happens On Screen**|**System / Backend Response**|**Browser / UI State**|
|---|---|---|---|---|
|**1**|**User**|Clicks "Edit Profile" button on<br>own profile. Navigates to<br>/profile/edit.|GET /users/me — pre-fills form<br>with current data.|_Edit profile form loads._<br>_Centred card layout_<br>_(640px max). Fields pre-_<br>_filled._|
|**2**|**User**|Clicks on avatar. Upload zone<br>overlay appears on the avatar<br>circle.|No call yet.|_Avatar: dashed border +_<br>_"Change photo" overlay_<br>_text on hover._|
|**3**|**User**|Selects image file. Crop modal<br>opens (square crop, 1:1 ratio).|No API call during crop.|_Crop modal: image_<br>_preview with_<br>_movable/scalable crop_<br>_frame._|
|**4**|**User**|Confirms crop. Avatar preview<br>updates immediately.|Upload cropped image to S3<br>via pre-signed URL.|_Avatar preview shows_<br>_new image with upload_<br>_progress ring around it._|
|**5**|**User**|Updates Display Name and<br>Bio fields.|No API call on typing.|_Character counters:_<br>_Display Name 50 char,_<br>_Bio 200 char._|
|**6**|**User**|Updates Game Niche: tag<br>multi-select input. Types "val"<br>— autocomplete shows<br>"Valorant". Clicks to add.|No API call — client-side<br>filtering of game list.|_Tags appear as pills_<br>_inside the input. Each_<br>_has an × to remove. Max_<br>_5 tags._|
|**7**|**User**|Clicks "Save Changes".|PATCH /users/me — {<br>displayName, bio, gameNiche,<br>avatarUrl }. Returns updated<br>user.|_Button: "Saving..." +_<br>_spinner. On success:_<br>_navigate back to /profile._|



_Confidential  ·  For UI/UX Designer & Solution Architect  ·  March 2026  ·  Desktop Web App — v1.0_ 

23 

NexaClip  ·  Web Application UX Flow  ·  End-to-End Interaction Design 

|**#**|**Actor**|**What Happens On Screen**|**System / Backend Response**|**Browser / UI State**|
|---|---|---|---|---|
|**8**|**System**|Profile page shows updated<br>data. Toast: "Profile updated<br>successfully."|NgRx auth store updated with<br>new user data.|_Profile page with new_<br>_avatar + bio visible._|



##### **J6.3 — Viewing Another User Profile (A08)** 

|**#**|**Actor**|**What Happens On Screen**|**System / Backend Response**|**Browser / UI State**|
|---|---|---|---|---|
|**1**|**User**|Clicks on another user's avatar<br>or username anywhere in the<br>app.|Angular Router navigates to<br>/users/:id.|_Profile page loads._<br>_Structure same as own_<br>_profile but: Follow button_<br>_replaces Edit button. No_<br>_edit overlays. Liked tab_<br>_hidden._|
|**2**|**User**|Clicks "Follow" button.|POST /users/:id/follow.|_Button: "Follow" →_<br>_"Following_✓_" (teal fill)._<br>_Follower count on their_<br>_profile +1._|
|**3**|**User**|Clicks a post thumbnail in the<br>content grid.|Angular Router navigates to<br>/feed/post/:id.|_Post detail slides in from_<br>_right._|



_Confidential  ·  For UI/UX Designer & Solution Architect  ·  March 2026  ·  Desktop Web App — v1.0_ 

NexaClip  ·  Web Application UX Flow  ·  End-to-End Interaction Design 

24 

#### **Journey 7 — Analytics Dashboard & Weekly Report** 

_Performance insight for free and Pro users_ 

##### **J7.1 — Analytics Dashboard Layout (A05)** 

###### **A05  Anal** **<mark>y</mark> tics Dashboard** _/analytics_ 

LAYOUT: Full content area. Max-width 1200 <mark>p</mark> x. No ri <mark>g</mark> ht sidebar column <mark>(</mark> anal <mark>y</mark> tics needs full width <mark>)</mark> . 

PAGE HEADER: "Analytics" H1 left. Date range dropdown right: "Last 7 days ▾ ". For Pro users on Mondays: amber banner "Your weekl <mark>y</mark> re <mark>p</mark> ort is read <mark>y</mark> → View re <mark>p</mark> ort". 

STAT CARDS ROW (4 cards): Total Views · Total Likes · Total Shares · Engagement Rate. Each: icon (24px), large number (display-md), label, trend delta (↑8% teal or ↓3% red). Engagement Rate card: locked for free users <mark>(</mark> frosted blur + lock icon + "Pro feature" label <mark>)</mark> . 

CHARTS SECTION (2 charts): Left (8 cols): "Views over time" line chart. Right (4 cols): "Content breakdown" donut. Free: line chart shows 3 da <mark>y</mark> s onl <mark>y</mark> . Rest blurred with "See 30-da <mark>y</mark> histor <mark>y</mark> with Pro →" overla <mark>y</mark> . 

BEST POSTING TIME (full width, Pro only): Heat map grid 7 days × 24 hours. Purple intensity scale. Free: fully blurred with "Unlock with Pro" centred overla <mark>y</mark> . 

TOP POSTS TABLE: Thumbnail · Title · Type · Views · Likes · Engagement Rate · Published. Sortable headers. Hover row: "View anal <mark>y</mark> tics" + "Share" inline actions. 

WEEKLY REPORT CARD (Pro only): Full-width purple-50 card. Claude-written narrative. 4 sections. Each action item has "→ Create from this" link. 

##### **J7.2 — Analytics Flow — Free User** 

|**#**|**Actor**|**What Happens On Screen**|**System / Backend Response**|**Browser / UI State**|
|---|---|---|---|---|
|**1**|**User**|Navigates to /analytics.|GET<br>/analytics/metrics?range=7d.<br>Plan check from JWT.|_Skeleton: 4 stat card_<br>_skeletons, 2 chart_<br>_skeletons._|
|**2**|**System**|Metrics load. Free user sees: 4<br>stat cards (Views, Likes,<br>Shares, Engagement Rate).<br>Engagement Rate has frosted<br>blur overlay + lock icon.|Metrics returned. Engagement<br>Rate value intentionally<br>included in response — just<br>blurred client-side.|_Cards animate in_<br>_(stagger 80ms)._<br>_Engagement Rate: blur_<br>_filter applied._|
|**3**|**User**|Clicks on the locked<br>Engagement Rate card.|No API call. Upgrade sheet<br>triggered client-side.|_Upgrade sheet slides up_<br>_from bottom. Shows:_<br>_engagement rate value_<br>_blurred behind sheet, Pro_<br>_benefit context._|
|**4**|**User**|Scrolls to Weekly Report card.<br>Sees 2 lines of real report text<br>then blur overlay. "Your Week<br>in Review" heading visible.|GET /analytics/report/latest<br>returns null for free user. Show<br>placeholder report with actual<br>structure.|_Report structure visible._<br>_Content blurred after line_<br>_2. "Unlock with Pro to_<br>_read your full report" CTA_<br>_centred._|
|**5**|**User**|Clicks "Unlock with Pro →".<br>Upgrade sheet opens.|Navigates to upgrade flow (see<br>Journey 10).|_Upgrade sheet. Feature_<br>_context: "Weekly Claude_<br>_AI report with your full_<br>_performance analysis."_|



_Confidential  ·  For UI/UX Designer & Solution Architect  ·  March 2026  ·  Desktop Web App — v1.0_ 

NexaClip  ·  Web Application UX Flow  ·  End-to-End Interaction Design 

25 

##### **J7.3 — Analytics Flow — Pro User** 

|**#**|**Actor**|**What Happens On Screen**|**System / Backend Response**|**Browser / UI State**|
|---|---|---|---|---|
|**6**|**User (Pro)**|Navigates to /analytics. All 4<br>stat cards show full data.<br>Line chart shows 30-day<br>history. Heat map visible<br>and interactive.|GET /analytics/metrics?range=30d<br>— extended range for Pro.|_Full analytics visible._<br>_No blur overlays. All_<br>_data accessible._|
|**7**|**System**|Monday morning: amber<br>banner at top: "Your weekly<br>report is ready → View<br>report". Notification badge<br>on Analytics SideNav item.|GET /analytics/report/latest returns<br>this week's Claude-written report.|_Banner visible. Badge_<br>_on SideNav._|
|**8**|**User (Pro)**|Clicks "View report". Full<br>report card expands in-<br>page.|Report already loaded — no<br>additional call.|_Report section scrolls_<br>_into view. Card_<br>_expands smoothly._|
|**9**|**User (Pro)**|Reads action item: "Post a<br>short Valorant clip on<br>Wednesday at 7pm." Clicks<br>"→ Create from this".|Angular Router navigates to /create<br>with query param:<br>?context=Wednesday+clip+Valorant.|_Create Hub loads._<br>_Context banner at top:_<br>_"From your weekly_<br>_plan: Post a Valorant_<br>_clip Wednesday 7pm."_|
|**10**|**User (Pro)**|Hovers over heat map cell<br>(e.g. Wednesday 7pm).|No API call.|_Tooltip appears:_<br>_"Wednesday 7pm —_<br>_Your highest_<br>_engagement window_<br>_(avg 3.2× above your_<br>_baseline)."_|



##### **J7.4 — Analytics Error & Edge States** 

|**Empty**|**Empty**|**Loading**|**Error**|
|---|---|---|---|
|New user with no posts:<br>illustration + "Publish your<br>first post to start seeing<br>analytics" + "Create now<br>→" button.|Pro user, no report yet<br>(first week): "Your first<br>weekly report will be<br>ready next Monday. Keep<br>creating content this<br>week."|Metrics loading: 4 stat<br>card skeletons + 2 chart<br>area skeletons exactly<br>matching real content<br>dimensions.|Analytics API error:<br>"Could not load your<br>analytics. We are working<br>on it." Retry button. Last<br>cached data shown if<br>available with "Showing<br>cached data from [date]"<br>notice.|



_Confidential  ·  For UI/UX Designer & Solution Architect  ·  March 2026  ·  Desktop Web App — v1.0_ 

NexaClip  ·  Web Application UX Flow  ·  End-to-End Interaction Design 

26 

#### **Journey 8 — Creator Coach (Claude Chat)** 

_AI-powered coaching for growth strategy_ 

The Creator Coach is the flagship Pro feature. Its UX must balance the intelligence of Claude with the warmth of a genuine advisor. The streaming response feels like a colleague thinking and responding in real time — not a chatbot. 

##### **J8.1 — Coach Layout (A06)** 

###### **A06  Creator Coach** _/coach_ 

LAYOUT: Full content area. Two-column. Left 280 <mark>p</mark> x <mark>(</mark> conversation histor <mark>y)</mark> . Ri <mark>g</mark> ht: main chat area. 

FREE USER GATE (shown before chat): Centred single-column overlay within the page. Claude icon 80px. "Meet your Creator Coach" H2. 3 benefit bullets. "3 free messages remaining" info badge (amber). "Start a conversation" <mark>p</mark> rimar <mark>y</mark> CTA. "U <mark>pg</mark> rade to Pro for unlimited" text link. 

LEFT PANEL — History: "New conversation" button top. List of previous conversations: date + first message excer <mark>p</mark> t. Active hi <mark>g</mark> hli <mark>g</mark> hted <mark>p</mark> ur <mark>p</mark> le-50. Scrollable. 

RIGHT PANEL — Chat area: 

HEADER (sticky): "Creator Coach" title. "Powered by Claude AI (Anthropic)" attribution badge (small, gray). Free users: "2 messa <mark>g</mark> es remainin <mark>g</mark> this month" amber counter to <mark>p</mark> -ri <mark>g</mark> ht. 

CONTEXT PILLS (first message only): Small chips showing known context: "Game: Valorant" · "Goal: Grow followers" · "Last week: 1.2K views". Ta <mark>pp</mark> able to u <mark>p</mark> date. 

MESSAGES: Scrollable area. Full hei <mark>g</mark> ht minus header and in <mark>p</mark> ut. 

INPUT AREA (sticky bottom): Multi-line textarea (1 row expanding to 4). Placeholder: "Ask your Coach an <mark>y</mark> thin <mark>g</mark> ...". Send button <mark>(p</mark> rimar <mark>y</mark> icon <mark>)</mark> . Ke <mark>y</mark> board shortcut: Ctrl+Enter. 

SUGGESTED PROMPTS (empty state only): 3 chip suggestions: "What should I post this week?" / "Why are m <u><mark>y</mark></u> views dro <mark>pp</mark> in <u><mark>g</mark></u> ?" / "Anal <u><mark>y</mark></u> se m <u><mark>y</mark></u> best- <mark>p</mark> erformin <u><mark>g</mark></u> content" 

##### **J8.2 — Coach Chat Flow (Pro User)** 

|**#**|**Actor**|**What Happens On Screen**|**System / Backend Response**|**Browser / UI State**|
|---|---|---|---|---|
|**1**|**User**|Navigates to /coach. Left<br>panel shows conversation<br>history (or empty state for<br>new users). Right panel<br>shows chat area with<br>context pills.|GET /coach/conversation — loads<br>conversation history (messages<br>JSONB array). GET<br>/analytics/summary?days=14 —<br>loads metrics context. GET<br>/trends/brief?niche={userGameNiche}<br>— loads today's trends.|_Page loads. Context_<br>_pills show personalised_<br>_tags. Chat history_<br>_loads._|
|**2**|**User**|Clicks "New conversation"<br>or types directly in input.<br>Types: "My views dropped<br>40% this week. What<br>happened?"|No API call on typing.|_Input field grows to 2_<br>_rows as text is entered._|
|**3**|**User**|Presses Ctrl+Enter or clicks<br>Send.|POST /coach/message — {<br>message: text, conversationId }.<br>Angular subscribes to WebSocket<br>room for this user.|_User message bubble_<br>_appears immediately_<br>_(right-aligned, navy-50_<br>_bg). Input clears. Send_<br>_button disabled._|



_Confidential  ·  For UI/UX Designer & Solution Architect  ·  March 2026  ·  Desktop Web App — v1.0_ 

27 

NexaClip  ·  Web Application UX Flow  ·  End-to-End Interaction Design 

|**#**|**Actor**|**What Happens On Screen**|**System / Backend Response**|**Browser / UI State**|
|---|---|---|---|---|
|**4**|**System**|Claude typing indicator<br>appears in chat (left-<br>aligned, purple-50 bubble, 3<br>animated dots).|BullMQ coach.worker picks up job.<br>Builds context: system prompt + last<br>30 messages + user metrics + trend<br>brief. Claude API streaming call<br>begins.|_Typing indicator: 3 dots_<br>_pulse sequentially._|
|**5**|**Claude**|Text begins streaming into<br>the Claude bubble. Each<br>token appears as it arrives:<br>"Looking at your data from<br>the past 14 days..."|WebSocket emits coach:token<br>events. Angular appends each token<br>to the message string in real time.|_Text streams character_<br>_by character. Cursor_<br>_blink at end of text._|
|**6**|**Claude**|Full response delivered.<br>Example: "Your views<br>dropped because your last<br>5 posts were over 45<br>seconds long. Your<br>audience strongly prefers<br>clips under 30 seconds —<br>your best post this month<br>was 22 seconds. This<br>week, aim for 20–28<br>second clips. Your<br>Wednesday 7pm slot is still<br>your strongest — use it."|WebSocket emits coach:complete<br>with full message. AI job record<br>updated with token cost.|_Cursor disappears._<br>_Response complete._<br>_Send button re-_<br>_enables._|
|**7**|**User**|Replies: "Can you write me<br>some clip ideas for this<br>week?"|Same pattern. Previous messages<br>included in context (last 30<br>messages).|_Conversation_<br>_continues. User_<br>_message bubble._<br>_Claude streaming_<br>_response._|
|**8**|**System**|Conversation auto-saved.<br>Left panel history updates<br>with this conversation's first<br>message as the label.|Conversation messages JSONB<br>updated in PostgreSQL after each<br>exchange.|_Left panel: new_<br>_conversation item at_<br>_top with first message_<br>_preview._|



##### **J8.3 — Free User Coach Experience** 

|**#**|**Actor**|**What Happens On Screen**|**System / Backend Response**|**Browser / UI State**|
|---|---|---|---|---|
|**9**|**User (Free)**|Navigates to /coach. Sees<br>gate screen: "Meet your<br>Creator Coach". "3 free<br>messages remaining" badge.|Check coach_message_count for<br>this month from Redis.|_Gate screen with 3_<br>_available messages_<br>_clearly communicated._|
|**10**|**User (Free)**|Clicks "Start a conversation".<br>Gate screen fades out. Chat<br>interface loads.|No API call. Just UI state change.|_Chat interface with_<br>_amber counter badge: "3_<br>_messages remaining_<br>_this month"._|
|**11**|**User (Free)**|Sends 1st message. Gets<br>Claude response. Counter →<br>"2 messages remaining".|Usage tracked in Redis:<br>rate:{userId}:coach_msgs:{YYYY-<br>MM} increments.|_Counter badge updates_<br>_after each exchange._|
|**12**|**User (Free)**|After 3rd message is sent and<br>response received. Input field<br>locked. Upgrade prompt<br>appears:|4th message attempt returns 403.|_Input disabled. Prompt_<br>_overlay: "You have used_<br>_your 3 free messages_<br>_this month. Upgrade to_<br>_Pro for unlimited_<br>_coaching." Two CTAs:_<br>_"Upgrade to Pro" +_|



_Confidential  ·  For UI/UX Designer & Solution Architect  ·  March 2026  ·  Desktop Web App — v1.0_ 

NexaClip  ·  Web Application UX Flow  ·  End-to-End Interaction Design 

28 

**# Actor What Happens On Screen System / Backend Response** 

**Browser / UI State** 

_"Come back next month"._ 

##### **J8.4 — Coach Error States** 

###### **Error** 

Claude API timeout (>15s): "Your Coach is taking a moment to think. This sometimes happens with complex questions." Still streaming if possible; else: "Try asking a shorter question or come back in a moment." 

###### **Error** 

###### **Loading** 

Network lost during Initial conversation load: streaming: Partial Skeleton for last 5 response shown with message pairs. Maintains "(Connection lost — scroll position. response may be incomplete)". Retry button to re-ask the same question. 

###### **Empty** 

First ever conversation: Welcome message from Claude already shown: "Hi! I'm your NexaClip Creator Coach. I know your game niche and your recent performance. What would you like to improve?" + 3 suggested <mark>q</mark> uestion chi <mark>p</mark> s. 

_Confidential  ·  For UI/UX Designer & Solution Architect  ·  March 2026  ·  Desktop Web App — v1.0_ 

NexaClip  ·  Web Application UX Flow  ·  End-to-End Interaction Design 

29 

#### **Journey 9 — Free to Pro Upgrade** 

_Upgrade moments, Stripe checkout, and plan activation_ 

The upgrade journey is triggered from multiple places in the product — always in context of the feature a user was trying to use. The upgrade sheet approach means users never leave the page they were on. 

##### **J9.1 — Upgrade Trigger Points** 

|**Trigger Location**|**Trigger Event**|**Upgrade Sheet Context**|
|---|---|---|
|Image Studio<br>(/create/image)|Daily limit (5 images) reached<br>on Generate click|Shows last generated image + "Unlimited<br>generations with Pro"|
|Analytics (/analytics)|Clicks locked Engagement Rate<br>card|Shows engagement rate preview blurred +<br>"Unlock full analytics"|
|Analytics (/analytics)|Clicks blurred Weekly Report<br>section|Shows report preview + "Get your Claude<br>AI weekly coaching report"|
|Creator Coach (/coach)|4th message in a month (free<br>limit)|Shows conversation context + "Unlimited<br>coaching conversations with Pro"|
|Content Library (/my-<br>content)|Uploads clip over 500MB (free<br>limit)|Shows file size indicator + "Upload up to<br>5GB with Pro"|
|Any page|Clicks "Upgrade" in SideNav<br>bottom banner|General upgrade sheet with full feature<br>comparison|
|/upgrade page|Direct navigation or deep link|Full pricing page (same as W03 but in app<br>context)|



##### **J9.2 — Upgrade Sheet Flow (In-Context)** 

|**#**|**Actor**|**What Happens On Screen**|**System / Backend Response**|**Browser / UI State**|
|---|---|---|---|---|
|**1**|**System**|Upgrade sheet slides up from<br>bottom of screen. Page dims<br>(backdrop overlay rgba(0,0,0,0.5)).<br>Sheet height: 70vh. Never full<br>screen.|Render upgrade sheet with<br>feature-specific context from<br>the trigger point.|_Sheet slides up with_<br>_spring animation_<br>_(350ms). Page scroll_<br>_locked._|
|**2**|**System**|Sheet content structure: 1. Hero<br>section: feature they were using +<br>what they gain. 2. Feature benefit<br>list: 8 Pro features with purple<br>checkmarks. 3. Pricing:<br>"$12/month" large text. Annual<br>toggle: "Save 17% — Pay<br>annually". 4. "Start Pro now →"<br>primary full-width CTA. 5. "Maybe<br>later" text link below button.|No API call to render sheet.|_Sheet renders fully with_<br>_all content visible (no_<br>_additional scrolling_<br>_needed within sheet)._|
|**3**|**User**|Clicks the annual/monthly toggle.|No API call. Price display<br>updates: $12/mo → $10/mo<br>equivalent.|_Price text updates_<br>_smoothly with number_<br>_transition animation._|



_Confidential  ·  For UI/UX Designer & Solution Architect  ·  March 2026  ·  Desktop Web App — v1.0_ 

30 

NexaClip  ·  Web Application UX Flow  ·  End-to-End Interaction Design 

|**#**|**Actor**|**What Happens On Screen**|**System / Backend Response**|**Browser / UI State**|
|---|---|---|---|---|
|**4**|**User**|Clicks "Start Pro now →".|POST /billing/create-checkout<br>— { planId: "pro_monthly" or<br>"pro_annual" }. Returns Stripe<br>checkout URL.|_Button: "Opening_<br>_checkout..." + spinner._<br>_Then redirect to Stripe._|
|**5**|**System**|Stripe checkout opens in SAME<br>TAB (no new window — prevents<br>popup blockers). Stripe-hosted<br>page. Email pre-filled from user<br>account.|Stripe Checkout Session<br>created server-side.|_Full page navigation to_<br>_Stripe checkout._<br>_Standard browser back_<br>_button returns to_<br>_NexaClip._|
|**6**|**User**|Completes payment on Stripe.<br>Redirected back to NexaClip<br>/upgrade/success?session_id=xxx.|Stripe webhook fires:<br>subscription.created. Identity<br>Service: update user.plan =<br>"pro". New JWT issued. Push<br>notification sent: "You are<br>now Pro!".|_Upgrade success page_<br>_loads._|
|**7**|**System**|Success page: confetti animation.<br>"Welcome to Pro!🎉" H1. List of<br>newly unlocked features animating<br>in (stagger). "Go back to what you<br>were doing →" primary CTA<br>(returns to the page where<br>upgrade was triggered).|Angular fetches updated user<br>via GET /auth/me. Updates<br>NgRx store with new plan.|_Confetti 2 seconds._<br>_Features unlock reveal_<br>_animation. CTA returns_<br>_user to exact location._|
|**8**|**User**|Clicks "Go back to what you were<br>doing →". Returns to<br>/create/image (or wherever<br>upgrade was triggered).|nx_return_to stored in<br>sessionStorage when<br>upgrade sheet opened. Used<br>to return.|_Returned to exact_<br>_page. All locked_<br>_features now unlocked._<br>_No more counter_<br>_badges. No blur_<br>_overlays._|



##### **J9.3 — Plan Downgrade / Cancellation Flow** 

|**#**|**Actor**|**What Happens On Screen**|**System / Backend Response**|**Browser / UI State**|
|---|---|---|---|---|
|**9**|**User**|Goes to /settings. Clicks<br>"Billing" sub-section. Sees:<br>current plan, next billing date,<br>"Cancel subscription" link.|GET /billing/status — returns<br>subscription details from<br>Stripe.|_Billing settings page._|
|**10**|**User**|Clicks "Cancel subscription".<br>Confirmation dialog: "Are you<br>sure? You will keep Pro<br>access until [date]. Your<br>content, analytics, and<br>conversations are not deleted."|No API call yet.|_Confirmation modal. Two_<br>_buttons: "Keep my Pro_<br>_plan" (primary) + "Yes,_<br>_cancel" (destructive red_<br>_text button)._|
|**11**|**User**|Confirms cancellation.|POST /billing/cancel — calls<br>Stripe subscription cancel at<br>period end.|_Success toast:_<br>_"Subscription cancelled._<br>_You have Pro access_<br>_until March 31." Billing_<br>_page updates to show_<br>_"Cancels on March 31."_|
|**12**|**System**|On expiry date: user plan<br>changes to free. Next login re-<br>issues JWT with plan: "free".<br>Pro features locked.|Stripe webhook:<br>subscription.deleted. Update<br>user.plan → "free". New JWT<br>on next login.|_Upgrade prompts_<br>_reappear. Features lock._<br>_No abrupt notification —_<br>_gentle re-introduction of_<br>_free limits._|



_Confidential  ·  For UI/UX Designer & Solution Architect  ·  March 2026  ·  Desktop Web App — v1.0_ 

NexaClip  ·  Web Application UX Flow  ·  End-to-End Interaction Design 

31 

#### **Journey 10 — Content Library & Settings** 

_Managing published content and account settings_ 

##### **J10.1 — Content Library (A11)** 

###### **A11  Content Librar** **<mark>y</mark>** _/my-content_ 

LAYOUT: Full content area. Table-st <mark>y</mark> le list view. 

FILTER BAR: "All" (default) / "Clips" / "Images" / "Drafts" / "Rejected" tab filters. Sort dropdown: "Newest first" / "Most viewed" / "En <mark>g</mark> a <mark>g</mark> ement". "Bulk select" checkbox in header row. 

TABLE HEADER: Checkbox · Thumbnail · Title · Type badge · Status badge · Views · Likes · Created date · Actions <mark>(</mark> ⋯ <mark>)</mark> . 

TABLE ROWS: Each row: 60px height. Thumbnail 80×45px. Title truncated to 1 line. Type: "Clip" or "Image" badge. Status: green "Published" / amber "Draft" / gray "Processing" / red "Rejected". View count. Like count. Formatted date. 

⋯ ROW HOVER: "View analytics" link appears. "Share" link appears. " " menu shows: Edit, Delete, Republish (if re <mark>j</mark> ected <mark>)</mark> . BULK SELECT MODE: Checkbox column activates. Bulk action bar appears at bottom: "Delete selected" (red) / "Ex <mark>p</mark> ort links". 

EMPTY STATE: Illustration. "Nothin <mark>g</mark> here <mark>y</mark> et. Create <mark>y</mark> our first <mark>p</mark> ost." Create CTA. 

|**#**|**Actor**|**What Happens On**<br>**Screen**|**System / Backend Response**|**Browser / UI**<br>**State**|
|---|---|---|---|---|
|**1**|**User**|Navigates to /my-<br>content. Table loads<br>with last 30 items.|GET<br>/content?userId=me&limit=30&sort=created_desc.|_Table skeleton (8_<br>_rows × 5 cols) →_<br>_real content with_<br>_stagger animation._|
|**2**|**User**|Clicks "Rejected" filter<br>tab.|GET /content?userId=me&status=rejected.|_Table reloads with_<br>_only rejected_<br>_content. If empty:_<br>_"No rejected posts_<br>_— your content_<br>_looks good!" with_<br>_checkmark_<br>_illustration._|
|**3**|**User**|Clicks⋯on a rejected<br>post. Dropdown: Edit /<br>Delete / Republish.|No call on menu open.|_Dropdown menu_<br>_appears (shadow-_<br>_lg card)._|
|**4**|**User**|Clicks "Republish".<br>Navigates back to the<br>content editor with<br>rejection reason<br>shown as a banner.|GET /content/:id — pre-fills editor with existing<br>content data.|_Image Studio or_<br>_Clip Editor opens._<br>_Amber banner:_<br>_"Previously_<br>_rejected: [reason]._<br>_Make edits and_<br>_republish."_|
|**5**|**User**|Clicks delete (⋯→<br>Delete). Confirmation<br>dialog.|No call yet.|_Modal: "Delete_<br>_this post? This_<br>_cannot be_<br>_undone." Confirm /_<br>_Cancel._|
|**6**|**User**|Confirms delete.|DELETE /content/:id — soft delete (status →<br>deleted, deleted_at timestamp).|_Row disappears_<br>_from table with_|



_Confidential  ·  For UI/UX Designer & Solution Architect  ·  March 2026  ·  Desktop Web App — v1.0_ 

NexaClip  ·  Web Application UX Flow  ·  End-to-End Interaction Design 

32 

**# Actor What Happens On System / Backend Response Browser / UI Screen State** _fade animation. Toast: "Post deleted."_ 

##### **J10.2 — Settings (A13)** 

|**Settings Section**|**Flow Description**|
|---|---|
|Account Settings|/settings/account: Change display name, email, and password. Email change<br>requires verification of new address. Password change requires current<br>password. All saved with PATCH /users/me.|
|Notification Settings|/settings/notifications: Toggle switches for each notification type: New follower,<br>Post liked, Comment received, Weekly report ready, Trend brief. Preferences<br>saved to user_preferences table.|
|Billing|/settings/billing: Shows current plan, next billing date, invoice history (last 6<br>invoices as links). Cancel subscription link. Upgrade CTA if on free plan.|
|Privacy|/settings/privacy: Toggle: Public profile / Private profile. Public feed visibility. Data<br>download request button (GDPR). Cookie preferences.|
|Danger Zone|/settings/account#danger: "Delete my account" section with red border. Requires<br>typing username to confirm. Shows consequences (all content deleted within 30<br>days). Irreversible. POST /users/me/delete.|



_Confidential  ·  For UI/UX Designer & Solution Architect  ·  March 2026  ·  Desktop Web App — v1.0_ 

NexaClip  ·  Web Application UX Flow  ·  End-to-End Interaction Design 

33 

## **11. Cross-Journe S stem Flows** **<u>y y</u>** 

These flows run automatically in the background across all journeys. They are not triggered by explicit user navigation but by system events. 

##### **11.1 — Content Moderation Flow (All Content Types)** 

Every piece of content goes through this flow automatically when the user taps Publish, regardless of content type (image, clip, meme). 

|**#**|**Actor**|**What Happens On Screen**|**System / Backend Response**|**Browser / UI State**|
|---|---|---|---|---|
|**1**|**User**|Taps "Publish to Feed" on<br>any content creation screen.|POST /content/:id/publish queues<br>moderation job (HIGH priority<br>BullMQ).|_Publish button:_<br>_"Publishing..." +_<br>_spinner._|
|**2**|**System**|Moderation check running<br>(<3 seconds). If <2 seconds:<br>only the button spinner is<br>visible — no separate UI<br>state.|Claude API call with<br>MODERATION_SYSTEM_PROMPT.<br>Returns { decision, reason,<br>confidence }.|_If <2s: only button_<br>_spinner. If 2–3s:_<br>_"Reviewing content..."_<br>_overlay appears on_<br>_the content preview._|
|**3**|**System**|Decision: APPROVED.<br>Success flow activates.|content.status → published. Feed<br>notified. Analytics event logged:<br>content.published.|_Button success state_<br>_(green flash 200ms)._<br>_Toast: "Your_<br>_[image/clip] is live!"_<br>_with "View on feed →"_<br>_link._|
|**4**|**System**|Decision:<br>FLAG_FOR_REVIEW.<br>Published anyway. Human<br>review queue populated.|content.status → pending_review.<br>Human reviewer notified.|_Same as APPROVED_<br>_from user perspective._<br>_Small "Under review"_<br>_dot on post visible only_<br>_to the post owner._|
|**5**|**System**|Decision: REJECTED.<br>Rejection screen overlays<br>the content.|content.status → rejected. Reason<br>stored.|_Current creation_<br>_screen: orange shield_<br>_icon + "We could not_<br>_publish this." heading._<br>_Plain-English reason._<br>_"Edit and try again"_<br>_primary button._<br>_"Remove this post"_<br>_text link._|
|**6**|**User**|Clicks "Edit and try again".<br>Returns to creation screen<br>with reason banner.|Content status remains "rejected"<br>until next publish attempt.|_Creation screen with_<br>_amber banner:_<br>_"Rejected: [reason]._<br>_Edit to address this."_|
|**7**|**User**|Makes edit. Re-taps Publish.|New moderation check. Fresh<br>Claude API call. Previous rejection<br>context not included (evaluated<br>fresh).|_Same flow from Step_<br>_1._|



##### **11.2 — Toast Notification System** 

_Confidential  ·  For UI/UX Designer & Solution Architect  ·  March 2026  ·  Desktop Web App — v1.0_ 

NexaClip  ·  Web Application UX Flow  ·  End-to-End Interaction Design 

34 

|**Trigger**|**Type**|**Message Copy**|**Duration**|
|---|---|---|---|
|Content published|Success (teal)|Your image is live! View<br>on feed →|4 seconds|
|Content rejected|Error (red)|We could not publish<br>this. See why →|6 seconds (longer for<br>important info)|
|Like action<br>confirmed|Info (subtle gray)|(No toast — like is silent,<br>optimistic UI only)|—|
|Follow confirmed|Success (teal)|(No toast — button state<br>change is sufficient)|—|
|Profile saved|Success (teal)|Profile updated.|3 seconds|
|Upload complete|Success (teal)|Upload complete —<br>openingeditor.|2 seconds (then auto-<br>navigate)|
|Upload error|Error (red)|Upload failed. Check<br>your connection and<br>retry.|6 seconds + Retry button|
|Plan upgraded|Success (teal)|Welcome to Pro! All<br>features unlocked.|6 seconds|
|Coach message<br>limit|Warning (amber)|You have used your 3<br>free messages this<br>month. Upgrade for<br>unlimited.|6 seconds + Upgrade link|
|Network offline|Warning (amber)|You are offline — some<br>features may be<br>unavailable.|Persistent until<br>reconnection|
|Network restored|Success(teal)|Back online.|2 seconds|



##### **11.3 — Push Notification → App Navigation** 

|**Notification Type**|**Deep Link Target**|**User Experience on Tap**|
|---|---|---|
|Weekly report ready<br>(Pro, Monday 8am)|nexaclip://analytics/report|Opens /analytics with report section<br>scrolled into view and highlighted.|
|New follower|nexaclip://users/:followerId|Opens the follower's profile page.|
|Comment on your post|nexaclip://feed/post/:postId#comments|Opens post detail with comments<br>panel expanded.|
|Content published (after<br>background processing)|nexaclip://my-content|Opens content library. New post<br>highlighted with pulsing ring for 3<br>seconds.|
|Trend brief available<br>(daily 8am)|nexaclip://feed|Opens feed. Trending Today widget<br>highlighted with purple border for 5<br>seconds.|
|Coach message<br>response (if app was<br>closed)|nexaclip://coach/:conversationId|Opens Coach with the specific<br>conversation scrolled to the new<br>response.|



_Confidential  ·  For UI/UX Designer & Solution Architect  ·  March 2026  ·  Desktop Web App — v1.0_ 

NexaClip  ·  Web Application UX Flow  ·  End-to-End Interaction Design 

35 

##### **11.4 — Session Expiry & Token Refresh** 

|**#**|**Actor**|**What Happens On Screen**|**System / Backend Response**|**Browser / UI State**|
|---|---|---|---|---|
|**1**|**System**|User is using the app. Access<br>token expires (1-hour TTL).|Angular HTTP interceptor<br>receives 401 response on any<br>API call.|_User sees nothing_<br>_unusual — intercept is_<br>_transparent._|
|**2**|**System**|Interceptor attempts silent<br>refresh.|POST /auth/refresh with<br>refresh token from<br>localStorage.|_The failed request is_<br>_queued. Refresh_<br>_proceeds._|
|**3**|**System**|Refresh succeeds. Original<br>request is retried automatically.|New access token stored.<br>Original request retried with<br>new token.|_User never sees a login_<br>_prompt. Feature works_<br>_normally._|
|**4**|**System**|Refresh fails (refresh token<br>also expired). User redirected<br>to login.|Both tokens cleared.<br>nx_return_to stored.|_Redirect to /login._<br>_Banner: "Your session_<br>_ended — log in to_<br>_continue." After login:_<br>_return to original page._|



_Confidential  ·  For UI/UX Designer & Solution Architect  ·  March 2026  ·  Desktop Web App — v1.0_ 

NexaClip  ·  Web Application UX Flow  ·  End-to-End Interaction Design 

36 

## **12. Error Handlin & Recover Flows** **<u>g y</u>** 

Every error in NexaClip has a designed recovery path. Users should never reach a dead end. This section defines the response to all error categories. 

##### **12.1 — Error Categories & Responses** 

|**Error Category**|**User Sees**|**Recovery Action**|**Backend Behaviour**|
|---|---|---|---|
|Form validation<br>(client)|Inline red text below each<br>invalid field on blur. Field<br>border turns red.|Fix the field that is<br>highlighted. Error clears<br>when field becomes<br>valid.|No API call made while<br>form is invalid.|
|API error (4xx —<br>user error)|Toast with specific,<br>actionable message. Red<br>border on relevant UI<br>element.|Button to retry or correct<br>the issue. Never just<br>"Close".|HTTP 4xx with body: {<br>message, errors? }.|
|API error (5xx —<br>server error)|Toast: "Something went<br>wrong on our end. We have<br>been notified." Retry<br>button.|Retry same action. If<br>persists: "Contact<br>support" link.|Error logged to<br>CloudWatch. Sentry<br>alert if configured.|
|Network timeout|Inline indicator: "Taking<br>longer than usual..." after 5<br>seconds. "Try again" after<br>15 seconds.|Retry button. For long AI<br>operations: "We will<br>notify you when ready."|Timeout logged.<br>Background retry for<br>idempotent operations.|
|Offline state|Persistent amber banner at<br>top: "You are offline."<br>Updated to teal when<br>reconnected.|Cached content remains<br>viewable. Write<br>operations queued for<br>reconnection.|Angular service worker<br>caches GET responses<br>for offline viewing.|
|Auth expired|Silent token refresh<br>attempted first. On failure:<br>redirect to login.|Login page with return<br>URL preserved.|Token refresh endpoint.<br>Clear expired tokens.|
|Rate limit (API)|For AI: "Our AI is very busy<br>right now. Your request is<br>queued." For other: toast.|Wait and auto-retry for AI<br>queue. Retry manually<br>for other limits.|BullMQ queue with retry<br>logic. 429 with Retry-<br>After header.|
|404 Not Found|Custom 404 page.<br>Illustration. "Page not<br>found." Two CTAs.|Go to homepage. Go to<br>previous page.|404 response. Angular<br>catches unknown<br>routes.|



##### **12.2 — Validation Flow — Signup Form** 

This exemplifies the validation pattern used consistently across all forms in the application. 

|**#**|**Actor**|**What Happens On Screen**|**System / Backend Response**|**Browser / UI State**|
|---|---|---|---|---|
|**1**|**User**|Clicks into Email field. Types<br>an invalid email: "notanemail".|No API call.|_Field: typing state — no_<br>_error during typing._|
|**2**|**User**|Clicks out of Email field (blur).|No API call.|_Client-side email format_<br>_validation. If invalid: red_<br>_border + "Please enter a_|



_Confidential  ·  For UI/UX Designer & Solution Architect  ·  March 2026  ·  Desktop Web App — v1.0_ 

37 

NexaClip  ·  Web Application UX Flow  ·  End-to-End Interaction Design 

|**#**|**Actor**|**What Happens On Screen**|**System / Backend Response**|**Browser / UI State**|
|---|---|---|---|---|
|||||_valid email address"_<br>_below field. Field retains_<br>_value._|
|**3**|**User**|Types valid email. Clicks out.|POST /auth/check-email<br>(debounced 400ms after blur).|_Validation loading: small_<br>_spinner in field right. On_<br>_response: if taken → red_<br>_+ "Email already_<br>_registered. Log in →". If_<br>_available: silent (no_<br>_success indicator_<br>_needed)._|
|**4**|**User**|Submits form with any<br>remaining invalid fields.|No API call until all fields valid.|_All invalid fields highlight_<br>_simultaneously. First_<br>_invalid field scrolls into_<br>_view. Focus moves to_<br>_first invalid field._|
|**5**|**User**|All fields valid. Submits form.<br>Server returns 409 (race<br>condition — username taken<br>between check and submit).|POST /auth/register returns<br>409.|_Username field: red_<br>_border + "This username_<br>_was just taken. Try a_<br>_different one." (specific_<br>_error, not generic)._|



##### **12.3 — Graceful Degradation Scenarios** 

|**Scenario**|**Degraded Behaviour**|**Full Recovery**|
|---|---|---|
|Claude API unavailable|Coach: "Coach is temporarily<br>unavailable. Try again in a few<br>minutes." Analytics reports: cached<br>last available. Onboarding: skip to<br>plan reveal withgeneric plan.|When Claude API recovers,<br>queued jobs process normally. No<br>data loss.|
|DALL-E unavailable|Image Studio: "Image generation is<br>temporarily unavailable. Try again<br>shortly." Stable Diffusion fallback if<br>configured.|Automatic retry when DALL-E API<br>recovers.|
|Redis unavailable|Rate limits disabled (allow all<br>requests). Leaderboard served<br>from PostgreSQL fallback (slower).<br>Session data served from DB.|Redis reconnects automatically.<br>State resumes.|
|S3 upload unavailable|Upload zone: "File storage is<br>currently unavailable. Try again in a<br>few minutes." No partial uploads.|Pre-signed URL generation retried.<br>No files corrupted.|
|WebSocket disconnected|Real-time features (streaming<br>Claude responses, live feed<br>updates) fall back to polling. 5-<br>second poll interval.|WebSocket reconnects<br>automatically on network recovery.<br>Streaming resumes.|



_Confidential  ·  For UI/UX Designer & Solution Architect  ·  March 2026  ·  Desktop Web App — v1.0_ 

NexaClip  ·  Web Application UX Flow  ·  End-to-End Interaction Design 

38 

## **13. Web-S ecific UX Patterns** **<u>p</u>** 

These patterns are specific to the desktop web experience and differ from typical mobile-first approaches. 

##### **13.1 — Keyboard Navigation** 

|**Keyboard Shortcut**|**Action**|
|---|---|
|Ctrl/Cmd + K|Open command palette (global search + quick actions). Available on all app<br>pages.|
|Ctrl/Cmd + Enter|Submit form or send message (multi-line textareas where Enter adds newline).|
|Escape|Close modal, dismiss sheet, cancel action.|
|Tab / Shift+Tab|Navigate between interactive elements (standard web pattern). Focus ring: 2px<br>purple.|
|Arrow keys|Navigate within menus, select dropdowns, calendar date pickers.|
|Space|Activate focused button or toggle. Play/pause video when video player is<br>focused.|
|/ (forward slash)|Focus the global search bar in TopBar when not in an input field.|
|G then F|Go to Feed (Gmail-style two-key navigation for power users).|
|G then C|Go to Create.|
|G then A|Go to Analytics.|



##### **13.2 — Hover States (Desktop Exclusive)** 

|**Element**|**Hover Behaviour**|
|---|---|
|ContentCard in feed|Slight elevation lift (translateY -2px, shadow-sm → shadow-md, 150ms). Play<br>button overlay appears on video thumbnails.|
|Follow button on cards|Changes from "Follow" to "Following✓" text on hover IF already following<br>(confirmation preview).|
|Navigation sidebar items|Background changes to navy-50. Left accent border appears (4px purple). Icon<br>and text shift right 4px.|
|TopNav links|Purple underline slides in from left (150ms). Underline width matches text.|
|Table rows|Row background: white → gray-50. "View analytics" and "Share" inline actions<br>fade in (opacity 0→1).|
|Stat cards|Shadow-sm → shadow-md. Subtle scale 1.0→1.01. Border color: gray-300 →<br>purple-300.|
|Pricing card features list|Feature rows highlight with purple-50 bg on hover. Checkmark icon scales up<br>slightly.|
|Coach context pills|Tooltip appears: "Click to update this context."|



_Confidential  ·  For UI/UX Designer & Solution Architect  ·  March 2026  ·  Desktop Web App — v1.0_ 

NexaClip  ·  Web Application UX Flow  ·  End-to-End Interaction Design 

39 

##### **13.3 — Right-Click & Context Menus** 

|**Element**|**Right-click / Context Menu Behaviour**|
|---|---|
|ContentCard<br>thumbnail|Custom context menu: "Open in new tab", "Copy link", "Share to...", "Save image"|
|User avatar<br>anywhere|Custom context menu: "View profile", "Follow/Unfollow"|
|Text in post caption|Browser native context menu (copy, search). No custom override.|
|SideNav items|No custom context menu — standard browser behaviour.|



##### **13.4 — Browser Tab Management** 

|**Scenario**|**Behaviour**|
|---|---|
|Opening post in new tab|Ctrl+Click on ContentCard opens /feed/post/:id in a new tab as a full page (not<br>SPA navigation). Complete app shell present in new tab.|
|Multiple NexaClip tabs|Each tab has independent JWT auth (all share the same localStorage token).<br>Tab-to-tab state not synced — each tab has its own feed scroll position.|
|Tab title during loading|Shows "Loading... — NexaClip" until page data resolves, then updates to page-<br>specific title.|
|Favicon badge|No unread notification count on favicon for MVP.|



##### **13.5 — Drag and Drop** 

|**Element**|**Drag & Drop Behaviour**|
|---|---|
|Video upload zone on<br>/create/clip|Full drop zone (entire dashed-border area). Drag-over: border turns solid<br>purple, background purple-50, "Drop here" instruction text. Drop: file validation<br>runs immediately.|
|Image upload on<br>/profile/edit|Avatar circle becomes a drop zone on drag-over. Dashed border ring appears.|
|Content reordering<br>(future)|Not in MVP scope. Timeline handles (trim editor) use drag but not HTML drag-<br>and-drop — they use Pointer Events for cross-browser precision.|



##### **13.6 — Browser History & Navigation** 

|**Pattern**|**Implementation**|
|---|---|
|Back button within app|Angular Router manages history stack. Back navigates to previous Angular<br>route — not a page reload.|
|Back from post detail|Returning from /feed/post/:id via back button scrolls feed to the card that was<br>clicked — scroll position preserved using Angular scroll restoration.|
|Back from upgrade|Returns to the page where upgrade was triggered (stored in sessionStorage as<br>nx_return_to before leaving).|
|Page refresh in app|Angular app re-initialises. Auth check runs. Correct page re-renders. All API<br>data re-fetched. No broken states from stale data.|



_Confidential  ·  For UI/UX Designer & Solution Architect  ·  March 2026  ·  Desktop Web App — v1.0_ 

NexaClip  ·  Web Application UX Flow  ·  End-to-End Interaction Design 

40 

**Pattern Implementation** Browser "Reopen closed Full page re-initialise. Same as page refresh. tab" 

_Confidential  ·  For UI/UX Designer & Solution Architect  ·  March 2026  ·  Desktop Web App — v1.0_ 

NexaClip  ·  Web Application UX Flow  ·  End-to-End Interaction Design 

41 

## **14. Com lete Screen & State Inventor** **<u>p y</u>** 

This table is the master reference for every screen in the NexaClip web app with its states and the Angular component responsible for it. 

|**ID**|**Screen**<br>**Name**|**Route**|**Component**|**States Required**|
|---|---|---|---|---|
|W01|Homepage|/|HomePageComponent|Default, Scrolled (nav<br>change), Hero demo:<br>animating/complete|
|W04|Login|/login|LoginComponent|Default, Loading, Error<br>(wrong creds), Error (locked),<br>Success|
|W05|Signup|/signup|SignupComponent|Default, Email checking,<br>Username checking,<br>Password strength, Loading,<br>Error (taken), Success|
|OB|Onboarding<br>Chat|/onboarding|OnboardingComponent|Q1–Q5 states, Generating<br>plan, Plan reveal, Skip|
|A01|Home Feed|/feed|FeedComponent|Loading (skeleton), Content<br>(following), Content<br>(discovery), Empty, Error,<br>Pull-to-refresh|
|A02|Create Hub|/create|CreateHubComponent|Default, With context banner,<br>Free limit banner, With<br>recent items|
|A03|Image<br>Studio|/create/image|ImageStudioComponent|Prompt empty, Prompt filled,<br>Generating (loading), Result,<br>Result with captions,<br>Publishing, Success, Limit<br>reached, Error|
|A04a|Clip Upload|/create/clip|ClipUploadComponent|Default, Drag-over,<br>Uploading (progress),<br>Complete, Error (file type),<br>Error (file size), Error<br>(network)|
|A04b|Clip Editor|/create/clip/:id/edit|ClipEditorComponent|Step 1 Trim: Loading frames,<br>Timeline ready, Trimming,<br>Preview. Step 2 Polish:<br>Processing steps 1–3,<br>Results ready. Step 3<br>Publish: Review, Publishing,<br>Success|
|A05|Analytics|/analytics|AnalyticsDashboardComponent|Loading, Free (locked<br>elements), Pro (full access),<br>Empty (no posts), Report<br>available (Monday), Error|
|A06|Creator<br>Coach|/coach|CoachComponent|Gate screen (free), Loading<br>history, Empty (first use),<br>Conversation active,|



_Confidential  ·  For UI/UX Designer & Solution Architect  ·  March 2026  ·  Desktop Web App — v1.0_ 

42 

NexaClip  ·  Web Application UX Flow  ·  End-to-End Interaction Design 

|**ID**|**Screen**<br>**Name**|**Route**|**Component**|**States Required**|
|---|---|---|---|---|
|||||Streaming response, Limit<br>reached, Error|
|A07|Post Detail|/feed/post/:id|PostDetailComponent|Loading, Loaded (image),<br>Loaded (video, muted),<br>Comments loading,<br>Comments loaded,<br>Comments empty|
|A08|User Profile|/users/:id|UserProfileComponent|Loading, Loaded (not<br>following), Loaded<br>(following), Own profile<br>(redirect), Empty (no posts),<br>Private|
|A09|Own Profile|/profile|OwnProfileComponent|Loading, Loaded with posts,<br>Loaded (no posts),<br>Incomplete onboarding<br>banner|
|A10|Edit Profile|/profile/edit|EditProfileComponent|Loading (prefill), Editing,<br>Uploading avatar, Saving,<br>Success, Error|
|A11|Content<br>Library|/my-content|ContentLibraryComponent|Loading, All content, Filtered<br>(clips/images/drafts/rejected),<br>Empty filter, Bulk select<br>mode, Deleting|
|A12|Upgrade<br>Page|/upgrade|UpgradePageComponent|Monthly pricing, Annual<br>pricing, Success (post-<br>payment), Already Pro|
|A13|Settings|/settings|SettingsComponent|Account, Notifications, Billing<br>(free), Billing (Pro — active),<br>Billing (cancelling), Privacy,<br>Danger Zone|
|ERR|404 Not<br>Found|**|NotFoundComponent|Default only|



_Confidential  ·  For UI/UX Designer & Solution Architect  ·  March 2026  ·  Desktop Web App — v1.0_ 

NexaClip  ·  Web Application UX Flow  ·  End-to-End Interaction Design 

43 

## **15. Flow Summar & Desi ner Handoff Notes** **<u>y g</u>** 

##### **15.1 — Journey Complexity Reference** 

|**Journey**|**Est. User Time**|**Screens Involved**|**Critical Success Metric**|
|---|---|---|---|
|J1: First Visit & Registration|3–5 min|W01, W05, W04|Signup completion rate ><br>60% of homepage visitors<br>who click CTA|
|J2: Onboarding Chat|90 seconds|OB (4 steps)|Completion rate > 85%.<br><10% skip.|
|J3: Image Creation|2–3 min|A02, A03|First image generated within<br>3 min of onboarding|
|J4: Clip Upload & Edit|5–8 min|A04a, A04b (3<br>steps)|Publish rate > 70% of users<br>who complete upload|
|J5: Feed & Engagement|Open-ended<br>(daily)|A01, A07|DAU/MAU ratio > 35%|
|J6: Profile Management|1–2 min|A08, A09, A10|Profile completion rate > 80%<br>of registered users|
|J7: Analytics|2–5 min|A05|Pro: weekly report open rate<br>> 70%. Free: upgrade<br>conversion > 5%.|
|J8: Creator Coach|5–20 min|A06|Coach usage per Pro user: ><br>3 sessions/week|
|J9: Upgrade|2–4 min|Upgrade sheet,<br>A12|Free-to-Pro conversion ><br>12% within 30 days of signup|
|J10: Settings|1–3 min|A13, A11|—|



##### **15.2 — Priority Order for Figma Prototype** 

The following prototypes should be built in Figma in this order to support early stakeholder demos and usability testing. 

|**#**|**Prototype Name**|**Screens to Connect**|**Purpose**|
|---|---|---|---|
|1|Core activation|W05 Signup → OB Chat → A02<br>Create Hub → A03 Image Studio →<br>A01 Feed|The most-watched demo. Must<br>feel fast and magical.|
|2|Upgrade moment|A03 (limit reached) → Upgrade<br>sheet → A12 → Success → return<br>to A03|Show investors the monetisation<br>path.|
|3|Creator Coach|A06 full conversation (pre-scripted<br>Claude responses)|Demonstrate AI value proposition.|
|4|Clip creation|A04a Upload → A04b Trim → A04b<br>Polish → Feed post|Most technically impressive flow.|



_Confidential  ·  For UI/UX Designer & Solution Architect  ·  March 2026  ·  Desktop Web App — v1.0_ 

NexaClip  ·  Web Application UX Flow  ·  End-to-End Interaction Design 

44 

|**#**|**Prototype Name**|**Screens to Connect**|**Purpose**|
|---|---|---|---|
|5|Analytics (Pro)|A05 full dashboard + weekly report +|Show the coaching intelligence|
|||create from report → A03|loop.|



###### **Final Note to the Design & Architecture Team** 

This document covers every user journey in the NexaClip web application. It is the definitive reference for how every screen connects, what every system response looks like, and how every error is handled. 

Key principles to maintain throughout the design and build: 

1. Web-first means desktop-first. Layouts are 12-column grid at 1280px+. Every layout decision starts from the desktop and adapts down — never the reverse. 

2. Every error has a recovery path. No dead ends. Every error state in this document includes a specific next action for the user. 

3. Optimistic UI everywhere possible. Likes, follows, and comments update immediately without waiting for server confirmation. Only revert on failure. 

4. The upgrade moment is never a wall. Free users see the product working before they see any paywall. The value is demonstrated before the price is shown. 

5. Claude is a colleague, not a feature. Coach responses stream naturally. There is no "AI mode" — Claude output appears in the same visual language as the rest of the product. 

_Confidential  ·  For UI/UX Designer & Solution Architect  ·  March 2026  ·  Desktop Web App — v1.0_ 

