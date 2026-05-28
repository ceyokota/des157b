(function () {
    console.log("reading js");
    "use strict";

    // ==========================================================================
    // UI ELEMENT SELECTIONS
    // ==========================================================================
    // Cache DOM references for the starting screen, progress bars, question cards,
    // and main content area to avoid repeated querySelectorAll calls
    const beginButton = document.querySelector("#begin-btn");
    const startingOverlay = document.querySelector("#starting-overlay");
    const questionSection = document.querySelector(".question");
    const progressContainer = document.querySelector('#progress-container');
    const progressBars = document.querySelectorAll("#progress-container .bar");
    const confirmBtn = document.querySelector('#confirm-btn');
    const cards = document.querySelectorAll('.option-card');
    const optionsContainer = document.querySelector('.options-container');
    const mainScenarioCard = document.querySelector('#main-scenario-card');

    // ==========================================================================
    // MATTER.JS PHYSICS ENGINE SETUP
    // ==========================================================================
    // Destructure the main Matter.js modules used for physics simulation
    
    const { Engine, Render, Runner, Bodies, Composite, Events, Body } = Matter;
    let engine, render, runner;

    // ==========================================================================
    // GAME STATE TRACKING
    // ==========================================================================

    let isPrologueMode = true; //indicate that we're currently in the opening screen (the title screen)
    let isEndGameMode = false; //we are not in the end screen yet
    let currentQuestionIndex = 0; //keeping track of the question we're on
    let selectedOptionIndex = null; //sets up a variable for it to keep track of selected option, but starts as null because we haven't selected anything yet

    // ==========================================================================
    // PLAYER SCORE TRACKER
    // ==========================================================================
    // Score metrics, starting on 0 for everything in the beginning
    let scoreTracker = {
        career: 0,
        money: 0,
        health: 0,
        relationships: 0,
        freedom: 0
    };

    // ==========================================================================
    // ORBS AND JAR SETUP
    // ==========================================================================

    // Jar container dimensions so the orbs know their boundaries
    const width = 380;
    const height = 550;

    // When orbs are sorted into columns towrads the end, they move to these X-coordinates.
    const categoryXMap = {
        career: 65,      // Left column
        money: 125,      // Center-left
        health: 185,     // Center
        relationships: 245, // Center-right
        freedom: 305     // Right column
    };

    // ==========================================================================
    // THE 10-YEAR FUTURE ARCHETYPE PRESETS
    // ==========================================================================
    //setting up the endings
    const futureRealitiesPreset = {
        burnout: `Ten years later, your résumé is impressive in ways that would have once felt impossible. You became the person people rely on when things get difficult — the one who can handle pressure, stay late, and somehow keep producing even when everyone else is overwhelmed. You learned how to survive on momentum for so long that slowing down started to feel unnatural.

From the outside, your life looks successful. Stable income. Accomplishments. A version of the future you once desperately wanted. But there are moments, usually late at night or during rare quiet weekends, where you realize how much of your twenties were spent treating exhaustion like proof that you cared enough.

You still keep old photos on your phone from college. Sometimes you look at them and remember a version of yourself that had more energy for small things — wandering conversations, impulsive plans, being emotionally present without multitasking something else in the background.

You got where you were trying to go.

The harder question became whether you ever learned how to arrive there without constantly feeling like you were falling behind.`,

        overwhelmed: `Ten years later, you don’t remember your final year of college as one coherent story. You remember fragments: unread notifications, unfinished plans, sitting in parked cars trying to mentally prepare yourself for the next thing. Back then, it felt like every area of life needed something from you at the same time.

For a while after graduation, you kept operating in survival mode. You made decisions based on urgency more than certainty. Some things slipped away simply because you didn’t have the capacity to hold onto everything simultaneously.

But over time, something changed. You became more honest about your limits. You stopped measuring your worth by how much stress you could absorb before collapsing. The life you eventually built wasn’t perfectly optimized, but it became sustainable in a way your college life never was.

You still sometimes envy people who seemed more “put together” back then. But many of them were falling apart too — they were just better at hiding it.

You learned that adulthood wasn’t about mastering chaos.

It was about learning which responsibilities were actually yours to carry.`,

        flourishing: `Ten years later, your life still feels recognizably yours.

You worked hard, but not at the cost of every other part of yourself. You stayed ambitious while still making room for people, rest, and experiences that mattered outside of achievement. That balance wasn’t effortless — you had to protect it deliberately, especially in environments that rewarded overwork and constant optimization.

There are still stressful weeks. There are still moments where everything feels uncertain again. But your life never became entirely consumed by one thing.

You kept friendships alive after graduation. You learned how to leave work at work sometimes. You figured out that success becomes harder to enjoy when you abandon everything else that makes you feel human.

A lot of people assumed balance meant a lack of ambition. What they didn’t understand was how difficult it actually is to maintain multiple parts of yourself at once.

You’re proud of your career, but it isn’t the only thing people associate you with.

Ten years later, the people closest to you still know who you are outside of what you produce.`,

        unfinished: `Ten years later, your path makes more sense in hindsight than it ever did while you were living it.

Back then, everyone around you seemed desperate to become a finalized version of themselves as quickly as possible. Careers, cities, relationships, routines — people acted like every decision needed to permanently define who they were going to be.

You struggled with that.

Part of you kept feeling like there had to be more time before everything became fixed.

So your twenties became less linear than you expected. You changed directions more than once. Some opportunities arrived later than they did for other people. Some relationships drifted while you were still trying to understand yourself.

But the uncertainty that once embarrassed you eventually became adaptability. You learned how to rebuild. How to pivot without seeing it as failure. How to let your identity evolve instead of forcing yourself into a life that stopped fitting.

Even now, you’re still becoming someone.

But ten years later, that no longer feels like evidence that you’re behind.`,

        balancer: `Ten years later, your life is held together by consistency more than extremes.

You were never the person who completely disappeared into work, but you also never fully abandoned your future for temporary comfort. You learned early that every part of life competes for your attention at the same time, and you spent years trying to make sure no single priority consumed everything else.

Sometimes you wondered if being balanced meant you were less exceptional. Other people seemed more singularly driven, more willing to sacrifice everything for one goal. But over time, you noticed how many of them eventually had to rebuild neglected parts of their lives from scratch.

You built slowly instead.

Your relationships lasted because you stayed present. Your career grew because you stayed consistent. Your mental health remained manageable because you understood that burnout is harder to recover from than most people realize while it’s happening.

Your life may not look dramatic from the outside.

But ten years later, there’s something quietly powerful about waking up and recognizing the life around you as something you intentionally maintained.`,

        climber: `Ten years later, you became the person who followed through.

While other people hesitated, you kept moving. Applications turned into jobs. Jobs turned into promotions. You learned how to tolerate uncertainty long enough to build something stable out of it. A younger version of yourself would probably be amazed at how competent you eventually became.

But ambition has a strange way of compressing time. Years passed faster than you expected because you were always focused on the next milestone instead of where you already were.

There are friendships you still miss in quiet moments. People you assumed you would reconnect with once life “slowed down.” Some of them did. Some of them became memories tied to old apartments, campus walks, and versions of yourself you no longer fully know how to access.

You don’t regret working hard. Most days, you’re proud of what you built.

But ten years later, success feels less like reaching the top of something and more like learning whether the version of yourself that arrived there still has room for other people.`,

        architect: `Ten years later, your life feels intentionally constructed.

You spent your twenties making practical decisions other people sometimes dismissed as boring or overly cautious. You budgeted carefully. You thought long-term. You prioritized opportunities that created stability instead of chasing every temporary impulse.

At times, it felt like you became an adult earlier than everyone else.

But eventually, the payoff became visible. You built routines that protected your future instead of constantly threatening it. Financial emergencies became manageable instead of catastrophic. Your life gained structure.

Still, there are moments where you wonder how many choices were genuinely yours versus choices made out of fear of instability. Sometimes you look at people who took bigger risks and feel a strange mix of admiration and confusion.

You learned how to create security.

The challenge, years later, became remembering that life is not only something to carefully maintain — it’s also something you’re allowed to fully participate in.`,

        achiever: `Ten years later, people still describe you as someone who somehow “does it all.”

You stayed ambitious without fully disappearing from the lives of the people you cared about. You answered calls during busy weeks. You kept showing up even when exhausted. You learned how to balance responsibility and emotional connection so consistently that most people never realized how overwhelmed you actually were.

Your career progressed. Your relationships survived. From the outside, your life looked remarkably functional.

But the cost of constantly maintaining everything at once was that you rarely felt fully rested anywhere.

Even now, part of you struggles to stop performing competence long enough to admit when you’re tired. You became incredibly dependable, but sometimes at the expense of your own ability to slow down without guilt.

Still, ten years later, there are people who trust you deeply because they remember that you kept showing up when it mattered.

You spent your twenties proving you could carry multiple versions of your life simultaneously.

Eventually, you had to learn that you deserved support too.`,

        anchor: `Ten years later, people still think of you when they think about home.

Not necessarily a physical place — more a feeling. During college, while everyone else was obsessing over résumés, applications, and future plans, you kept protecting the emotional parts of life that felt easy to neglect. You remembered birthdays. You answered difficult texts. You showed up for people even when it wasn’t convenient.

Some opportunities passed you by because of that. There were moments where your life moved slower than other people’s. But many of the relationships you invested in lasted because they were built on genuine consistency instead of proximity.

You learned that adulthood can become isolating very quickly if nobody actively fights against it.

Ten years later, your life may not look the most impressive on paper, but it feels deeply inhabited. People trust you. Friends still call you during important moments. You became part of the emotional infrastructure of other people’s lives.

And despite everything that changed after graduation, very few people who knew you back then ever doubted that you cared.`,

        wanderer: `Ten years later, your twenties are difficult to summarize cleanly.

You moved more than expected. Changed plans midway through them. Said yes to experiences that didn’t always make practical sense at the time. While other people rushed toward stability, you kept chasing moments that felt alive enough to remember later.

Some people assumed you were directionless.

But what they misunderstood was that you were trying to protect your ability to feel connected to your own life before responsibilities hardened everything into routine.

There are still nights you think about old road trips, temporary apartments, conversations with people you’ll probably never see again. Those memories stayed vivid because you were fully present for them when they happened.

Eventually, you did build stability — just not on the timeline everyone else expected.

Ten years later, you’ve learned that freedom isn’t the absence of responsibility. It’s the ability to recognize when your life no longer feels like it belongs to you and having the courage to change direction before resentment settles in permanently.`,

        survivor: `Ten years later, you are still grateful for the version of yourself that finally chose to rest.

Back then, it felt like the world rewarded people for destroying themselves productively. Everyone around you seemed exhausted, anxious, constantly available, constantly optimizing. At some point, you realized you didn’t want your entire adulthood to feel like that.

So you started protecting your peace earlier than most people do.

You slept instead of overworking yourself into numbness. You stepped back when your body told you something was wrong. You learned that ambition becomes dangerous when it’s treated as more important than your ability to remain emotionally functional.

There were moments where you worried you were falling behind. Sometimes you watched other people progress faster and questioned whether you were making excuses for yourself.

But ten years later, many of those same people are only beginning to recover from patterns you interrupted years earlier.

Your life is not perfect. But it feels sustainable.

And after everything, sustainability became more valuable to you than speed.`,

        ghost: `Ten years later, people from college still occasionally wonder what happened to you.

Not because you vanished dramatically, but because you slowly became harder to reach. During your final years in school, life started feeling emotionally loud in a way you didn’t fully know how to explain. Expectations, obligations, conversations, constant accessibility — eventually you began pulling away simply to hear yourself think again.

At first, the distance helped. You felt calmer. More protected. You built routines that belonged entirely to you.

But isolation has a way of becoming comfortable.

There are friendships you miss but no longer know how to restart. Messages you still think about replying to years later. Sometimes you wonder whether people interpreted your withdrawal as indifference when it was actually exhaustion.

Still, ten years later, you know something important: disappearing was never really the goal.

You were trying to preserve the parts of yourself that felt like they were dissolving under everyone else’s expectations.

Eventually, healing meant learning how to reconnect without losing your sense of peace in the process.`,

        detached: `Ten years later, independence still comes naturally to you.

You learned early how to rely on yourself emotionally. During college, while everyone else seemed constantly entangled in expectations, plans, and group dynamics, you became skilled at keeping distance between yourself and anything that threatened your autonomy.

Part of that was confidence.

Part of it was self-protection.

You built a life where nobody could fully control your time, identity, or direction. And in many ways, that freedom became one of the things you value most about adulthood.

But emotional distance can quietly harden into habit. There are moments where you realize you became so focused on preserving your independence that vulnerability started feeling like weakness instead of connection.

People often describe you as calm, capable, hard to read.

The truth is more complicated.

Ten years later, you still believe freedom matters deeply. You just understand now that real freedom also includes the ability to let people matter to you without immediately needing to retreat from them.`,

        drifter: `Ten years later, your life doesn’t look the way you expected during graduation.

Not because you failed, but because you resisted turning yourself into one fixed version of a person too early. You changed careers once, maybe twice. You moved cities unexpectedly. You left situations that looked stable from the outside because something about them quietly stopped feeling alive.

For a long time, you worried that everyone else had some clearer sense of direction than you did.

Eventually, you realized many people were just better at pretending certainty than actually feeling it.

Your life became defined less by one long-term plan and more by your willingness to adapt when something no longer fit who you were becoming. That flexibility brought instability sometimes. It also brought experiences and perspectives you never would have found if you had forced yourself to stay still.

Ten years later, you still don’t have every answer.

But you’ve stopped viewing uncertainty as proof that your life is failing.

To you, uncertainty became evidence that your life was still capable of changing.`,

        provider: `Ten years later, you became someone other people could depend on financially, emotionally, or both.

During college, while many people focused on freedom or self-discovery, you were already thinking about consequences. Rent. Savings. Family responsibilities. Stability. You learned how quickly financial stress can shape every other part of a person’s life.

So you made practical choices.

You worked longer hours. You prioritized consistency. Sometimes you sacrificed spontaneity because uncertainty simply felt too expensive to romanticize.

Ten years later, your life has structure. You built something sustainable enough that other people can lean on you without everything collapsing underneath the weight.

The challenge now is remembering that your value was never supposed to come solely from how much you can carry for everyone else.`
    };

    // ==========================================================================
    // DATA MATRIX: THE 8 SCENARIOS
    // ==========================================================================
    const questionsData = [
        {
            time: "Monday, 10:41 PM",
            prompt: "You’re in the library with two classmates finishing a group project due at midnight. Most of it is done, but your section still needs revisions. Your group has already been working for hours, and everyone is tired but pushing through because your professor hinted that strong final projects sometimes get noticed by industry recruiters.\n\nYour phone keeps lighting up with messages from Maya. She went to a party earlier and texts you privately saying she feels overwhelmed and wants to leave, but she doesn’t want to “make it a thing” in the group chat. She hasn’t explicitly asked you to come get her, but she’s clearly not okay.",
            options: [
                {
                    title: "Leave to pick her up",
                    text: "You tell your group you need to step out for a bit. You figure you’ll make it up later somehow. It doesn’t feel like something you can ignore right now.",
                    outputs: [{ quality: "relationships", value: 3 }, { quality: "career", value: -3 }, { quality: "health", value: -1 }]
                },
                {
                    title: "Stay and finish",
                    text: "You stay where you are and try to finish what you started. She didn’t explicitly ask you to come, and everyone here is counting on you to pull your weight.",
                    outputs: [{ quality: "career", value: 3 }, { quality: "relationships", value: -3 }, { quality: "health", value: -1 }]
                },
                {
                    title: "Ask someone else to help her",
                    text: "You quickly message a couple people you know to see if someone closer can swing by, while you keep working and try not to lose your place in the project.",
                    outputs: [{ quality: "freedom", value: 1 }, { quality: "career", value: 1 }, { quality: "relationships", value: -1 }]
                }
            ]
        },
        {
            time: "Wednesday, 3:26 PM",
            prompt: "After class, your professor pulls you aside and offers you a position assisting on a research project. It’s a strong resume opportunity and could lead to recommendation letters or industry connections. However, it’s unpaid and requires a consistent weekly time commitment.\n\nYou’ve recently been checking your bank account more often than usual. Rent is coming up, and your campus job barely covers essentials. You’ve also started skipping small expenses without really noticing it anymore. You realize that if you take the new position, you have to cut down hours on your paid position, putting you in an even tighter spot.\n\nThe professor is waiting for an answer by the end of the week.",
            options: [
                {
                    title: "Accept position",
                    text: "You agree to the new opportunity and cut some of your hours on your paid job. It feels like the kind of opportunity that only shows up when someone else thinks you’re ready for it. It’s an opportunity you’d rather have than regret not taking, even if it means tightening things for a while.",
                    outputs: [{ quality: "career", value: 3 }, { quality: "money", value: -3 }, { quality: "freedom", value: -1 }]
                },
                {
                    title: "Decline for financial stability",
                    text: "You tell her you can’t make it work right now. You’ve been trying to keep yourself financially steady, and adding something that doesn’t immediately support that feels risky in a way you’re not comfortable with at the moment.",
                    outputs: [{ quality: "money", value: 3 }, { quality: "career", value: -3 }]
                },
                {
                    title: "Ask for reduced commitment",
                    text: "You ask if there’s a way to be involved in a smaller capacity, even if it means that you only have minimal impact on the work. You don’t want to lose the opportunity entirely, but you’re also trying to be realistic about what you can actually sustain right now.",
                    outputs: [{ quality: "career", value: 1 }, { quality: "freedom", value: 1 }, { quality: "money", value: -1 }]
                }
            ]
        },
        {
            time: "Friday, 6:18 PM",
            prompt: "Your friend group is planning a beach bonfire tonight. It’s become a “last semester tradition” thing, and Maya says most of your close friends will be there. People are talking like this is one of the last weekends everyone will be together before jobs, moves, and graduation scatter everyone.\n\nAt the same time, you receive an email: you’ve been invited to a job interview tomorrow morning at 8 AM. It’s for a position you actually care about, not just something you applied to randomly. The interview prep materials are long, and you haven't started.\n\nYou’re trying to decide whether tonight is something you can afford to lose sleep over.",
            options: [
                {
                    title: "Go to bonfire",
                    text: "You decide to go. It feels strange to miss something that everyone is already framing as a memory-in-progress. You tell yourself you’ll figure out tomorrow when it comes, even if it means showing up less prepared than you’d like.",
                    outputs: [{ quality: "relationships", value: 3 }, { quality: "freedom", value: 2 }, { quality: "career", value: -2 }]
                },
                {
                    title: "Stay home and prepare",
                    text: "You stay in. You close the door at night and try to focus on the interview prep, even though part of you keeps thinking about everyone else out there and how easy it would’ve been to just show up.",
                    outputs: [{ quality: "career", value: 3 }, { quality: "relationships", value: -3 }, { quality: "freedom", value: -1 }]
                },
                {
                    title: "Go, then pull an all-nighter",
                    text: "You go for a while and stay longer than you planned. This doesn’t seem like something you can miss, even though you have other priorities going on. When you get home, you cram the materials and head to bed at 5am, only getting a couple hours of sleep before waking up for your interview.",
                    outputs: [{ quality: "relationships", value: 1 }, { quality: "career", value: 1 }, { quality: "health", value: -2 }]
                }
            ]
        },
        {
            time: "Sunday, 5:52 PM",
            prompt: "After your interview, you go home for dinner. Your family conversation slowly shifts from casual updates to questions about your plans after graduation. Your mom brings up the cost of rent in your city and mentions that moving back home could help you save money while you figure things out.\n\nYour younger sibling also casually mentions they might need financial help with school next year. The conversation isn’t tense, but it feels heavier than intended.\n\nOn the drive back, you start mentally calculating what staying independent would actually require.",
            options: [
                {
                    title: "Move back home",
                    text: "You start thinking seriously about the idea of moving back. It would simplify a lot, thinking about the impact on your finances and mental health. You decide to text your mom to ask about moving back home after graduation, even if it changes how independent the next chapter of your life feels.",
                    outputs: [{ quality: "money", value: 3 }, { quality: "relationships", value: 1 }, { quality: "freedom", value: -3 }]
                },
                {
                    title: "Stay independent",
                    text: "You lean toward staying where you are. It feels important to you to keep your independence intact, even if that means things will be more expensive and uncertain for a while.",
                    outputs: [{ quality: "freedom", value: 3 }, { quality: "money", value: -3 }, { quality: "health", value: -1 }]
                },
                {
                    title: "Avoid deciding",
                    text: "You don’t commit to anything yet. It feels like the kind of decision you shouldn’t force while you’re still in the middle of everything else.",
                    outputs: [{ quality: "freedom", value: 1 }, { quality: "health", value: -1 }]
                }
            ]
        },
        {
            time: "Tuesday, 10:17 PM",
            prompt: "You’ve started noticing a pattern: you’re either working, recovering from work, or thinking about work. Maya texts asking if you want to grab food, and you almost decline automatically before realizing you haven't properly seen her in days.\n\nDuring dinner, she mentions that you’ve seemed “kind of absent lately,” and not in a dramatic way, but more like you’re always partially somewhere else.\n\nAt the same time, you’ve started getting responses from recruiters and professors, and things are finally moving forward in a way they weren't before.",
            options: [
                {
                    title: "Reconnect socially",
                    text: "You try to make more space for people again and decide to reach out to Maya to catch up again soon, even if it means stepping back from some of the momentum you’ve been building on your career.",
                    outputs: [{ quality: "relationships", value: 3 }, { quality: "health", value: 2 }, { quality: "career", value: -3 }]
                },
                {
                    title: "Focus on career momentum",
                    text: "You stay focused on what’s starting to work professionally. It feels like something you don't want to lose track of, even if it means being less available than before.",
                    outputs: [{ quality: "career", value: 3 }, { quality: "money", value: 1 }, { quality: "relationships", value: -3 }, { quality: "health", value: -1 }]
                },
                {
                    title: "Pull back socially",
                    text: "You pull back a bit from everything at once. Not in a dramatic way, but just enough to stop feeling like you’re constantly being pulled in different directions. You decide to take the next day off to rest and recuperate.",
                    outputs: [{ quality: "freedom", value: 2 }, { quality: "relationships", value: -2 }, { quality: "health", value: -1 }]
                }
            ]
        },
        {
            time: "Thursday, 1:48 AM",
            prompt: "You’re awake way later than you planned. You’ve been switching between job applications, bank balance checks, and old photos. You find one from freshman year — a group hangout in a dorm where everything felt simpler, even if you were just as stressed then.\n\nNow everything feels more permanent. Mistakes feel like they “count” more.\n\nYou can’t tell if staying up is helping you feel in control or just making everything worse.",
            options: [
                {
                    title: "Keep working",
                    text: "You plug in your laptop and open a new application tab, deciding to finish at least five more submissions before you sleep. You tell yourself you’ll rest after this batch is done so you don't fall further behind tomorrow.",
                    outputs: [{ quality: "career", value: 2 }, { quality: "money", value: 1 }, { quality: "health", value: -2 }]
                },
                {
                    title: "Sleep",
                    text: "You close your laptop, put your phone face down, and physically leave your desk to get ready for bed. You don’t respond to anything, you just decide that whatever is unfinished will stay unfinished until morning.",
                    outputs: [{ quality: "health", value: 3 }, { quality: "freedom", value: 1 }, { quality: "career", value: -1 }]
                },
                {
                    title: "Text someone you miss",
                    text: "You pick up your phone and respond to the message you’ve been avoiding. It turns into a pleasant short back-and-forth and gets your mind off the work temporarily. While replying, you realize your laptop is still open in the background, but you don't fully return to it.",
                    outputs: [{ quality: "relationships", value: 2 }, { quality: "health", value: 1 }, { quality: "freedom", value: -1 }]
                }
            ]
        },
        {
            time: "Friday, 4:09 PM",
            prompt: "Maya sends a group message planning a final weekend trip before graduation. Almost everyone responds immediately with excitement. It’s supposed to be a cabin trip a few hours away — one last shared moment before people start leaving.\n\nAt the same time, you’re behind on applications, your savings are lower than you expected this month, and you’re already feeling burnt out from the week.\n\nThe group is waiting for your response before confirming the booking.",
            options: [
                {
                    title: "Go on trip",
                    text: "You reply to the group confirming you’re going, then start figuring out transportation details and what time you’ll need to leave. You don’t really pause to check your workload again, you just commit and adjust your schedule around it.",
                    outputs: [{ quality: "relationships", value: 3 }, { quality: "freedom", value: 2 }, { quality: "career", value: -3 }, { quality: "money", value: -1 }]
                },
                {
                    title: "Stay behind",
                    text: "You open your laptop, find the application you were halfway through, and start actively filling it out. You mute the group chat so notifications stop pulling your attention while you work through the deadline.",
                    outputs: [{ quality: "career", value: 3 }, { quality: "money", value: 3 }, { quality: "relationships", value: -3 }, { quality: "freedom", value: -1 }]
                },
                {
                    title: "Go briefly",
                    text: "You don’t reply immediately. Instead, you message that you’re unsure and need a bit of time. You leave your laptop open on the application tab but end up scrolling through the group chat logistics without fully committing either way.",
                    outputs: [{ quality: "relationships", value: 1 }, { quality: "career", value: 1 }, { quality: "freedom", value: 1 }]
                }
            ]
        },
        {
            time: "Sunday, 10:30 PM",
            prompt: "It’s Sunday night after the trip decisions have played out. Graduation is close enough that it feels like everything is wrapping up whether you’re ready or not.\n\nYour room has half-packed boxes, unfinished tasks, and a calendar filled with reminders for things you’re not sure you'll have time to complete. Maya texts you asking if you want to meet for one last walk around campus before things get too busy.\n\nYou realize this might be one of the last “normal” moments you'll have here, but also one of the only chances you have to catch up on everything you’ve been avoiding.",
            options: [
                {
                    title: "Go with Maya",
                    text: "You grab your jacket, leave your laptop open on your desk, and head outside. You don't fully resolve anything you were working on, but you step away before deciding to stay longer.",
                    outputs: [{ quality: "relationships", value: 3 }, { quality: "health", value: 1 }]
                },
                {
                    title: "Stay and finish responsibilities",
                    text: "You tell Maya you can’t make it out right now, close the message thread, and sit back down to finish what’s on your laptop before you let yourself leave the room.",
                    outputs: [{ quality: "career", value: 3 }, { quality: "money", value: 1 }, { quality: "relationships", value: -3 }]
                },
                {
                    title: "Rest alone",
                    text: "You stand up, but instead of fully committing to leaving or staying, you start packing small things on your desk, charger, notebook, phone, while still texting Maya back slowly, not giving a clear yes or no yet.",
                    outputs: [{ quality: "health", value: 3 }, { quality: "freedom", value: 1 }]
                }
            ]
        }
    ];

    // --- COLOR ASSIGNMENT PALETTE ---
    const colors = {
        career: { 
            stroke: 'rgba(115, 158, 240, 1)', 
            glow: 'rgba(115, 158, 240, 0.5)' 
        },       
        money: { 
            stroke: 'rgba(102, 210, 144, 1)', 
            glow: 'rgba(102, 210, 144, 0.5)' 
        },        
        health: { 
            stroke: 'rgba(235, 110, 110, 1)', 
            glow: 'rgba(235, 110, 110, 0.5)' 
        },       
        relationships: { 
            stroke: 'rgb(238, 126, 225)', 
            glow: 'rgba(238, 126, 177, 0.5)' 
        },
        freedom: { 
            stroke: 'rgba(243, 213, 110, 1)', 
            glow: 'rgba(243, 213, 110, 0.5)' 
        }       
    };

    // ==========================================================================
    // USER INTERACTION: BEGIN BUTTON
    // ==========================================================================
    // When the user clicks "Begin Experience", hide the intro screen, show the
    // first question, and initialize the physics engine for orb simulation.
    beginButton.addEventListener("click", function () {
        startingOverlay.style.display = "none"; //when click ok button, the overlay disappears
        
        //switches over to the section layout which includes the question box and progress bars
        questionSection.classList.remove("hidden");
        progressContainer.classList.remove("hidden");
        questionSection.style.display = "grid";
        progressContainer.style.display = "flex";

        initJarPhysics(); //turn on physics
        renderPrologueScreen(); //toggles prologue screen
    });

    // ==========================================================================
    // PHYSICS ENGINE INITIALIZATION
    // ==========================================================================
    // Sets up Matter.js engine, creates the jar collision boundaries, and
    // attaches custom rendering logic for orb glows. Called once on "Begin".
    function initJarPhysics() {
        engine = Engine.create(); //sets up the library
        engine.gravity.y = 0.16; //set gravity

        render = Render.create({
            element: document.querySelector('#matter-jar-container'), //creates a container inside your jar container
            engine: engine, //links it to the physics engine
            options: {
                width: width, //sets width and height of container
                height: height,
                wireframes: false, //makes it so the container is invisible (invisible walls)
                background: 'transparent' //makes it so the container is invisible (invisible walls)
            }
        });

        //makes sure the orbs phsyics always update
        Render.run(render);
        runner = Runner.create();
        Runner.run(runner, engine);

        //setup
        const jarMaterial = { 
            isStatic: true, 
            render: { visible: false } 
        };
        const wallThickness = 8;
        const jarCenterX = width / 2;
        const jarCenterY = height / 2 - 10;
        const jarWidth = 340;
        const jarHeight = 560;

        //creates the walls of the jar using Matter.js bodies
        const jarBottom = Bodies.rectangle(jarCenterX, jarCenterY + jarHeight/2 - 10, jarWidth - 40, wallThickness, { ...jarMaterial, chamfer: { radius: 15 } });
        const jarLeft = Bodies.rectangle(jarCenterX - jarWidth/2, jarCenterY, wallThickness, jarHeight - 80, jarMaterial);
        const jarRight = Bodies.rectangle(jarCenterX + jarWidth/2, jarCenterY, wallThickness, jarHeight - 80, jarMaterial);
        
        const jarBottomLeft = Bodies.rectangle(jarCenterX - jarWidth/2 + 25, jarCenterY + jarHeight/2 - 30, 60, 60, { ...jarMaterial, angle: Math.PI / 4 });
        const jarBottomRight = Bodies.rectangle(jarCenterX + jarWidth/2 - 25, jarCenterY + jarHeight/2 - 30, 60, 60, { ...jarMaterial, angle: -Math.PI / 4 });

        const neckLeft = Bodies.rectangle(jarCenterX - jarWidth/2 + 35, jarCenterY - jarHeight/2 + 55, 60, 40, { ...jarMaterial, angle: -Math.PI / 5 });
        const neckRight = Bodies.rectangle(jarCenterX + jarWidth/2 - 35, jarCenterY - jarHeight/2 + 55, 60, 40, { ...jarMaterial, angle: Math.PI / 5 });

        //adds the walls to the physics world
        Composite.add(engine.world, [jarBottom, jarLeft, jarRight, jarBottomLeft, jarBottomRight, neckLeft, neckRight]);

        // Custom rendering for orb glows: after each render, loop through all bodies and draw a glow effect on those with customStyle properties.
        const ctx = render.context;
        Events.on(render, 'afterRender', function() {
            const allBodies = Composite.allBodies(engine.world);
            allBodies.forEach(body => {
                if (body.customStyle) {
                    ctx.save();
                    ctx.translate(body.position.x, body.position.y);
                    ctx.rotate(body.angle);
                    
                    ctx.shadowColor = body.customStyle.glowColor;
                    ctx.shadowBlur = 18; 
                    ctx.strokeStyle = body.customStyle.glowColor;
                    ctx.lineWidth = 7; 
                    
                    ctx.beginPath();
                    ctx.arc(0, 0, body.customStyle.radius, 0, 2 * Math.PI);
                    ctx.stroke();
                    ctx.restore();
                }
            });
        });

        setupInteractionFlow();
    }

    // ==========================================================================
    // SCREEN STATE RENDERING
    // ==========================================================================
    // Functions that update the main card content based on the current game state.

    // Displays the prologue/intro screen with the framing narrative.
    function renderPrologueScreen() {
        isPrologueMode = true; //we are now in the prolougue section!
        isEndGameMode = false; // not in end section yet...
        mainScenarioCard.classList.add("prologue-mode"); //set the card styling to prologue mode (smaller text, different layout)
        optionsContainer.classList.add("hidden"); //sets the options to hidden since we don't need them for the prologue

        //set the prologue text content
        mainScenarioCard.querySelector("h1").innerText = "The Final Stretch";
        mainScenarioCard.querySelector("p").innerHTML = `You’re entering the final stretch of college life.

Things are moving forward whether you feel ready or not. Conversations start carrying more weight, opportunities feel harder to ignore, and small decisions begin to feel strangely permanent.

Over the next few weeks, you’ll navigate situations involving work, relationships, money, rest, and the pressure of figuring out what comes next. Every choice affects different parts of your life, sometimes in ways you expect and sometimes in ways you don’t.

There are no perfect choices. Only trade-offs.

<strong>The question is: what will you choose to fill your jar with?</strong>`;

        confirmBtn.textContent = "Begin Experience"; //set button
    }

    function renderCurrentQuestion() {
        // Displays the current question prompt and three option choices.
        // Handles progress bar updates and button state management.
        // Transitions to endgame when all questions are exhausted.

        //handles edge case of filling 9th progress bar when we hit the 8th question (since we start at index 0)
        if (currentQuestionIndex === 8) { 
            if(progressBars[8]) progressBars[8].classList.add("active");
        }

        // Check if we hit the limit / end of game
        if (currentQuestionIndex >= questionsData.length) {
            showEndGame();
            return;
        }
    
        //switches out of prologue mode
        isPrologueMode = false;
        mainScenarioCard.classList.remove("prologue-mode");
        optionsContainer.classList.remove("hidden");
    
        //changes content to questions content
        const currentData = questionsData[currentQuestionIndex];
        mainScenarioCard.querySelector("h1").innerText = currentData.time;
        mainScenarioCard.querySelector("p").innerText = currentData.prompt;

        // Loops through the option cards and updates their text based on the current question's options
        cards.forEach((card, idx) => {
            const optData = currentData.options[idx];
            card.querySelector("h3").innerText = optData.title;
            card.querySelector("p").innerText = optData.text;
            card.classList.remove('selected'); //resets their selected state from prev question
        });

        //update the progress bar on the top
        progressBars.forEach((bar, idx) => {
            if (idx <= currentQuestionIndex) {
                bar.classList.add("active");
            } else {
                bar.classList.remove("active");
            }
        });
    }

    // ==========================================================================
    // USER INTERACTION: CARD SELECTION & CONFIRM FLOW
    // ==========================================================================
    // Handles all user interactions during the question phase:
    // - Selecting an option card highlights it and enables the confirm button
    // - Confirming spawns orbs based on the selected option's score outputs
    // - Progresses to the next question or triggers endgame
    function setupInteractionFlow() {
        cards.forEach((card, index) => {
            card.addEventListener('click', function() {
                if (isPrologueMode || isEndGameMode) return; 
                
                // Remove selection from all, add to this one
                cards.forEach(c => c.classList.remove('selected'));
                this.classList.add('selected');
                
                selectedOptionIndex = index;
                
                // IMPORTANT: This enables the button as soon as they pick an option
                confirmBtn.disabled = false; 
            });
        });

        confirmBtn.addEventListener('click', function() {
            // PROLOGUE FLOW
            if (isPrologueMode) {
                renderCurrentQuestion();
                return;
            }

            // SELECTION FLOW
            if (selectedOptionIndex === null) return;

            // 1. DISABLE BUTTON IMMEDIATELY to prevent double-clicks
            confirmBtn.disabled = true;

            const currentData = questionsData[currentQuestionIndex];
            const chosenOption = currentData.options[selectedOptionIndex];

            // 2. Score and spawn orbs
            chosenOption.outputs.forEach(output => {
                scoreTracker[output.quality] += output.value;
                for (let i = 0; i < Math.abs(output.value); i++) {
                    spawnBall(output.quality, output.value < 0);
                }
            });

            currentQuestionIndex++;
            
            // 3. Move to next state
            setTimeout(() => {
                renderCurrentQuestion();
                // We keep it disabled until the next card is selected 
                // (The selection logic above will re-enable it)
                confirmBtn.disabled = true; 
            }, 600);
        });
    }

    // ==========================================================================
    // ORB SPAWNING
    // ==========================================================================
    // Creates a new physics body (orb) representing a player choice impact.
    // isDark indicates whether the choice was negative (dark) or positive (light).
    // The orb will fall into the jar and later be sorted into its category column.
    function spawnBall(qualityName, isDark) {
        const jarCenterX = width / 2;
        const jarHeight = 530;

        const spawnX = jarCenterX + (Math.random() * 40 - 20);
        const spawnY = (height / 2) - jarHeight/2 + 20; 
        
        const radius = 22; 
        const colorSet = colors[qualityName];

        const ballOptions = {
            friction: 0.05,
            frictionAir: 0.012, 
            restitution: 0.55, 
            density: 0.001,
            render: {
                fillStyle: isDark ? '#000000' : '#ffffff', 
                strokeStyle: colorSet.stroke,
                lineWidth: 5
            }
        };

        const ball = Bodies.circle(spawnX, spawnY, radius, ballOptions);
        ball.customStyle = { glowColor: colorSet.glow, radius: radius };
        ball.gameProperties = { quality: qualityName, isDark: isDark, phase: "idle" };

        Composite.add(engine.world, ball);
    }

    // ==========================================================================
    // ENDGAME SEQUENCE
    // ==========================================================================
    // Triggered when all 8 questions are answered.
    // Disables gravity, initiates the sorting pipeline to organize orbs into
    // columns by category, then triggers annihilation (opposite pairs cancel).
    // Finally displays the final archetype story.
    function showEndGame() {
        isEndGameMode = true;
        
        // NEW: This hides the text card, leaving the right side empty
        mainScenarioCard.classList.add("hidden"); 
        
        optionsContainer.classList.add("hidden");
        document.querySelector(".confirm-container").style.display = "none";
        
        // Shut down gravity
        engine.gravity.y = 0;
        
        const allBodies = Composite.allBodies(engine.world).filter(b => b.gameProperties);
        allBodies.forEach(ball => {
            ball.gameProperties.phase = "sorting";
            ball.collisionFilter.mask = 0;
            Body.setVelocity(ball, { x: 0, y: 0 });
            Body.setAngularVelocity(ball, 0);
            Body.setStatic(ball, false);
        });

        runInJarColumnSortPipeline(() => {
            // TRIGGER: This makes the labels appear under the columns
            document.querySelector("#chart-labels").classList.remove("hidden");
            
            setTimeout(executeSlowInJarAnnihilationSequence, 800);
        });
    }

    // Sorts all orbs into their category columns without overlapping.
    // Animates each orb to its lane's X-position and stacks them vertically.
    // Calls doneCallback when animation completes.
    function runInJarColumnSortPipeline(doneCallback) {
        const gameBalls = Composite.allBodies(engine.world).filter(b => b.gameProperties);
        const categories = ['career', 'money', 'health', 'relationships', 'freedom'];
        const ballsToAnimate = [];
        
        categories.forEach(cat => {
            const catBalls = gameBalls
                .filter(ball => ball.gameProperties.phase === "sorting" && ball.gameProperties.quality === cat)
                .sort((a, b) => b.position.y - a.position.y);

            catBalls.forEach((ball, index) => {
                const targetX = categoryXMap[cat];
                const targetY = 510 - (index * (ball.circleRadius * 2 + 5));
                ballsToAnimate.push({ ball, targetX, targetY });
            });
        });

        animateBallsToTargets(ballsToAnimate, () => {
            if (doneCallback) doneCallback();
        });
    }

    // Pairs opposing orbs (light vs dark) within each category and shrinks them
    // simultaneously over 800ms until they disappear. This represents how
    // conflicting priorities or trade-offs cancel each other out.
    // After all pairs are removed, realigns remaining orbs and shows the ending.
    function executeSlowInJarAnnihilationSequence() {
        const gameBalls = Composite.allBodies(engine.world).filter(b => b.gameProperties);
        const categories = ['career', 'money', 'health', 'relationships', 'freedom'];
        const pairsToDestroy = [];

        categories.forEach(cat => {
            const catBalls = gameBalls.filter(b => b.gameProperties.quality === cat && b.gameProperties.phase !== "destroyed");
            const lightOrbs = catBalls.filter(b => !b.gameProperties.isDark);
            const darkOrbs = catBalls.filter(b => b.gameProperties.isDark);
            const pairCount = Math.min(lightOrbs.length, darkOrbs.length);

            for (let i = 0; i < pairCount; i++) {
                pairsToDestroy.push({ light: lightOrbs[i], dark: darkOrbs[i] });
            }
        });

        if (pairsToDestroy.length > 0) {
            pairsToDestroy.forEach(pair => {
                pair.light.gameProperties.phase = "destroyed";
                pair.dark.gameProperties.phase = "destroyed";
            });

            mainScenarioCard.querySelector("p").innerText = `Opposing actions collide... Faded choices and trade-offs neutralize each other inside your glass space.`;

            const duration = 800;
            const startTime = Date.now();
            const shrinkData = pairsToDestroy.map(pair => ({
                light: pair.light,
                dark: pair.dark,
                startLight: pair.light.circleRadius,
                startDark: pair.dark.circleRadius
            }));
            const ease = t => t * t * (3 - 2 * t);

            const shrinkInterval = setInterval(() => {
                const elapsed = Math.min(Date.now() - startTime, duration);
                const progress = ease(elapsed / duration);
                const targetRatio = 1 - progress;
                let activeShrinks = 0;

                shrinkData.forEach(data => {
                    if (data.light) {
                        const nextRadius = Math.max(0.1, data.startLight * targetRatio);
                        const scale = nextRadius / data.light.circleRadius;
                        Body.scale(data.light, scale, scale);
                        if (elapsed < duration) activeShrinks++;
                    }
                    if (data.dark) {
                        const nextRadius = Math.max(0.1, data.startDark * targetRatio);
                        const scale = nextRadius / data.dark.circleRadius;
                        Body.scale(data.dark, scale, scale);
                        if (elapsed < duration) activeShrinks++;
                    }
                });

                if (elapsed >= duration) {
                    clearInterval(shrinkInterval);
                    pairsToDestroy.forEach(pair => {
                        if (pair.light) Composite.remove(engine.world, pair.light);
                        if (pair.dark) Composite.remove(engine.world, pair.dark);
                    });

                    realignInJarColumnHeights(() => {
                        mainScenarioCard.classList.add("end-game-mode");
                        mainScenarioCard.querySelector("h1").innerText = "Experience Complete";
                        printUnifiedFinalMetricsDashboard();
                        confirmBtn.disabled = false;
                    });
                }
            }, 16);

            return;
        }

        // FIXED: Combined layout screen print builds metrics list AND archetype summary simultaneously inside the expanded box frame
        realignInJarColumnHeights(() => {
            mainScenarioCard.classList.add("end-game-mode");
            mainScenarioCard.querySelector("h1").innerText = "Experience Complete";
            printUnifiedFinalMetricsDashboard();
            confirmBtn.disabled = false;
        });
    }

    // After annihilation removes pairs, re-stacks remaining orbs in their columns
    // to eliminate gaps and create a clean final visual. Called before displaying
    // the archetype story and final metrics.
    function realignInJarColumnHeights(doneCallback) {
        const categories = ['career', 'money', 'health', 'relationships', 'freedom'];
        const gameBalls = Composite.allBodies(engine.world).filter(b => b.gameProperties);
        const ballsToAnimate = [];

        categories.forEach(cat => {
            let columnStackIndex = 0;
            let catBalls = gameBalls.filter(b => b.gameProperties.quality === cat).sort((a,b) => b.position.y - a.position.y);
            
            catBalls.forEach(ball => {
                const targetX = categoryXMap[cat];
                const targetY = 510 - (columnStackIndex * (ball.circleRadius * 2 + 5));
                ballsToAnimate.push({ ball, targetX, targetY });
                columnStackIndex++;
            });
        });

        animateBallsToTargets(ballsToAnimate, doneCallback);
    }

    // ==========================================================================
    // ANIMATION HELPER
    // ==========================================================================
    // Smoothly animates a batch of orbs from their current positions to target
    // coordinates over 800ms using ease-in-out easing. Used for sorting,
    // realigning, and repositioning phases. Executes doneCallback when complete.
    function animateBallsToTargets(ballsToAnimate, doneCallback) {
        if (ballsToAnimate.length === 0) {
            if (doneCallback) doneCallback();
            return;
        }

        const duration = 800;
        const startTime = Date.now();

        ballsToAnimate.forEach(({ ball }) => {
            Body.setStatic(ball, false);
            Body.setVelocity(ball, { x: 0, y: 0 });
            Body.setAngularVelocity(ball, 0);
            ball._animateStart = { x: ball.position.x, y: ball.position.y };
        });

        const ease = t => t * t * (3 - 2 * t);

        const animationInterval = setInterval(() => {
            const elapsed = Math.min(Date.now() - startTime, duration);
            const progress = ease(elapsed / duration);
            let anyMoving = false;

            ballsToAnimate.forEach(({ ball, targetX, targetY }) => {
                if (!ball || !ball.position || !ball._animateStart) return;

                const startX = ball._animateStart.x;
                const startY = ball._animateStart.y;
                const nextX = startX + (targetX - startX) * progress;
                const nextY = startY + (targetY - startY) * progress;

                Body.setPosition(ball, { x: nextX, y: nextY });

                if (elapsed < duration) {
                    anyMoving = true;
                }
            });

            if (!anyMoving) {
                clearInterval(animationInterval);
                ballsToAnimate.forEach(({ ball, targetX, targetY }) => {
                    if (!ball || !ball.position) return;
                    Body.setPosition(ball, { x: targetX, y: targetY });
                    Body.setVelocity(ball, { x: 0, y: 0 });
                    Body.setAngularVelocity(ball, 0);
                    Body.setStatic(ball, true);
                    delete ball._animateStart;
                });
                if (doneCallback) doneCallback();
            }
        }, 16);
    }

    // ==========================================================================
    // ARCHETYPE SELECTION LOGIC
    // ==========================================================================
    // Determines the player's final archetype based on their scoreTracker values.
    // Uses a multi-step decision tree:
    // 1. Override states (extreme score combinations)
    // 2. Tie-breaking rules (for tied highest scores)
    // 3. Single dominant stat logic
    // 4. Fallback to "unfinished"
    function getFinalArchetype() {
        const stats = ['career', 'money', 'health', 'relationships', 'freedom'];
        const s = scoreTracker;

        // Step 1 — Override states
        if (s.health <= -6 && s.career >= 5) return 'burnout';
        if (stats.filter(key => s[key] <= -5).length >= 3) return 'overwhelmed';
        if (stats.every(key => s[key] > 0)) return 'flourishing';
        if (stats.every(key => s[key] >= -3 && s[key] <= 3)) return 'unfinished';
        if (stats.filter(key => s[key] >= 3).length >= 3 && !stats.some(key => s[key] <= -2)) return 'balancer';

        const highestValue = Math.max(...stats.map(key => s[key]));
        const topStats = stats.filter(key => s[key] === highestValue);

        // Step 2 — Tie archetypes
        if (topStats.length >= 2) {
            const has = key => topStats.includes(key);

            if (topStats.length === 2) {
                if (has('career') && has('money')) return 'architect';
                if (has('career') && has('relationships')) return s.health <= -2 ? 'achiever' : 'balancer';
                if (has('career') && has('health')) return 'balancer';
                if (has('career') && has('freedom')) return 'drifter';
                if (has('relationships') && has('freedom')) return 'wanderer';
                if (has('relationships') && has('health')) return 'anchor';
                if (has('health') && has('freedom')) return 'survivor';
                if (has('money') && has('freedom')) return 'provider';
            }

            if (topStats.length === 3) {
                const hasAll = (...keys) => keys.every(key => has(key));
                if (hasAll('career', 'money', 'health')) return s.freedom <= -3 ? 'architect' : 'balancer';
                if (hasAll('career', 'relationships', 'health')) return s.health <= -2 ? 'achiever' : 'balancer';
            }

            return 'balancer';
        }

        // Step 3 — Single dominant stat
        const dominant = topStats[0];

        switch (dominant) {
            case 'career':
                if (s.relationships <= -4) return 'climber';
                if (s.money >= 4 && s.freedom <= -3) return 'architect';
                if (s.relationships >= 4 && s.health <= -2) return 'achiever';
                return 'climber';
            case 'relationships':
                if (s.career <= -4) return 'anchor';
                if (s.freedom >= 4 && s.money <= -2) return 'wanderer';
                return 'anchor';
            case 'health':
                if (s.relationships <= -4) return 'ghost';
                return 'survivor';
            case 'freedom':
                if (s.relationships <= -3) return 'detached';
                if (s.career <= -3 && s.money <= -3) return 'wanderer';
                return 'drifter';
            case 'money':
                if (s.freedom <= -3) return 'provider';
                return 'architect';
            default:
                return 'unfinished';
        }
    }

    // Maps archetype keys to their display titles shown in the final story heading
    const archetypeLabelMap = {
        burnout: 'The Burnout',
        overwhelmed: 'The Overwhelmed',
        flourishing: 'The Flourishing',
        unfinished: 'The Unfinished',
        balancer: 'The Balancer',
        climber: 'The Climber',
        architect: 'The Architect',
        achiever: 'The Achiever',
        anchor: 'The Anchor',
        wanderer: 'The Wanderer',
        survivor: 'The Survivor',
        ghost: 'The Ghost',
        detached: 'The Detached',
        drifter: 'The Drifter',
        provider: 'The Provider'
    };

    // ==========================================================================
    // FINAL RESULTS DISPLAY
    // ==========================================================================
    // Calculates the final archetype, retrieves its corresponding story text,
    // and displays the player's score metrics alongside their personalized
    // "Ten Years Later" narrative. Reveals the main card with end-game styling.
    function printUnifiedFinalMetricsDashboard() {
        const dominantArchetype = getFinalArchetype();
        const selectedStoryOutput = futureRealitiesPreset[dominantArchetype] || futureRealitiesPreset.unfinished;
        const archetypeTitle = archetypeLabelMap[dominantArchetype] || 'Future Archetype';

        // 2. Prepare the combined string
        const dashboardHTMLString = `
            <strong>Your priority metrics scorecard:</strong><br>
            👔 Career Priority Score: <strong>${scoreTracker.career}</strong><br>
            💶 Financial Armor Score: <strong>${scoreTracker.money}</strong><br>
            ❤️ Personal Well-being Score: <strong>${scoreTracker.health}</strong><br>
            🌸 Human Connection Score: <strong>${scoreTracker.relationships}</strong><br>
            💛 Total Autonomy Score: <strong>${scoreTracker.freedom}</strong>
            <hr>
            <strong>${archetypeTitle}</strong><br>
            ${selectedStoryOutput}
        `;

        // 3. Update the UI once
        mainScenarioCard.querySelector("p").innerHTML = dashboardHTMLString;
        
        // 4. Reveal and style the card
        mainScenarioCard.classList.remove("hidden");
        mainScenarioCard.classList.add("end-game-mode");
    }



})();