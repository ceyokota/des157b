(function () {
    console.log("reading js");

    // UI Element Selections
    const beginButton = document.getElementById("begin-btn");
    const startingOverlay = document.getElementById("starting-overlay");
    const questionSection = document.querySelector(".question");
    const progressContainer = document.querySelector('#progress-container');
    const progressBars = document.querySelectorAll("#progress-container .bar");
    const confirmBtn = document.getElementById('confirm-btn');
    const cards = document.querySelectorAll('.option-card');
    const optionsContainer = document.querySelector('.options-container');
    const mainScenarioCard = document.getElementById('main-scenario-card');

    // Matter.js Module Destructuring
    const { Engine, Render, Runner, Bodies, Composite, Events, Body } = Matter;
    let engine, render, runner;
    let physicsInitialized = false;

    const width = 380;
    const height = 550;

    // Game Progression States
    let isPrologueMode = true; 
    let isEndGameMode = false;
    let currentQuestionIndex = 0;
    let selectedOptionIndex = null; 

    let scoreTracker = {
        career: 0,
        money: 0,
        health: 0,
        relationships: 0,
        freedom: 0
    };

    // Horizontal target lanes for columns inside the 380px wide jar wrapper
    // These X-coordinates match the center of the 380px jar wrapper 
    // to create 5 distinct lanes for the orbs to stack into
    const categoryXMap = {
        career: 65,      // Lane 1
        money: 125,      // Lane 2
        health: 185,     // Lane 3
        relationships: 245, // Lane 4
        freedom: 305     // Lane 5
    };

    // ==========================================================================
    // THE 10-YEAR FUTURE ARCHETYPE PRESETS
    // ==========================================================================
    const futureRealitiesPreset = {
        career: `Ten years later, the midnight oil you burned in the campus library has hardened into the foundation of a towering professional life. You sit in a pristine office overlooking a skyline that recognizes your name, holding the strategic influence you always craved. \n\nBut control comes with a quiet weight. Your calendar is an unyielding machine, and when your phone lights up late at night, it is always a crisis to manage, never a spontaneous invitation. You achieved the recognition you sacrificed sleep for.\n\nYou have built an impressive monument to your ambition, but sometimes, standing at the top, you wonder if you left the windows open too wide to catch a ghost of the warmth you left behind.`,

        money: `Ten years down the road, financial anxiety is a distant memory. Your bank account is secure, your investments are structured, and rent is no longer a calculation that keeps you awake at 3 AM. You bought yourself the ultimate armor against uncertainty.\n\nYet, safety has its own invisible walls. In prioritizing survival and stability, you took fewer creative risks, turning down paths that were beautifully fragile but carried no guarantees. Your life is an efficiently engineered, predictable machine.\n\nYou stand on solid ground, heavily protected, but occasionally you look at the margins of your spreadsheet and realize you traded a few wild sparks for a very comfortable hearth.`,

        health: `Ten years later, your life moves with a deep, intentional cadence. You didn't burn out; you survived the great sorting of your twenties with your peace of mind and vitality intact. You wake up feeling grounded, having learned early that a broken vessel holds no water.\n\nThis boundaries-first lifestyle, however, required turning away from the high-velocity currents. You watched peers sprint past you into powerful positions or launch volatile, brilliant ventures while you chose to sleep, rest, and pull back.\n\nYour jar is clear, peaceful, and unbroken. You have preserved your well-being perfectly, navigating life at a pace that allows you to feel every step, even if the view is a quiet forest rather than a crowded summit.`,

        relationships: `Ten years later, your life is crowded with laughter, shared tables, and deep roots. The bonfire traditions didn't end at graduation; they mutated into late-night living room deep-dives and friends who show up on your doorstep without asking. When crisis hits, you are surrounded by an unbreakable safety net of hands.\n\nTo keep these ties tight, you consistently stepped sideways from the career ladder. Professionally, your resume is modest, and your savings don't allow for luxury or effortless independence. You built a collective rather than an empire.\n\nYour wealth is entirely human, measured in the people who know your flaws and love you anyway—a beautifully messy, interconnected tapestry that leaves little room for solo flight.`,

        freedom: `Ten years later, you are a ghost in the system, untethered and beautifully elusive. You kept your independence completely intact, rejecting standard paths, corporate standard ladders, and heavy emotional anchors. You live across time zones, packing your life into boxes at a moment's notice.\n\nBut total autonomy can feel surprisingly cold. Without permanent commitments, consistency can slip away; you are rich in horizons but light on roots. Maya and old college faces are distant social media updates now.\n\nYou have won the right to go anywhere, do anything, and answer to absolutely no one. You possess the open air, even if you sometimes wish there was a specific porch light waiting for you to land.`,

        balanced: `Ten years later, your life is an intricate dance of spinning plates. You didn't give yourself entirely to the office, nor did you vanish into isolation or let your friendships completely scatter. You live in a state of rolling compromise, constantly adjusting the weight.\n\nBecause you refused to choose an extreme, you didn't become a tycoon, a nomad, or a textbook saint. Your career is steady but not explosive; your friendships are close but require deliberate scheduling; your health is a work in progress.\n\nYour jar is a vibrant, kaleidoscopic mixture of shifting colors. It is not a perfect monument, but a deeply human framework—built completely out of conscious trade-offs.`
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
        career: { stroke: 'rgba(115, 158, 240, 1)', glow: 'rgba(115, 158, 240, 0.5)' },       
        money: { stroke: 'rgba(102, 210, 144, 1)', glow: 'rgba(102, 210, 144, 0.5)' },        
        health: { stroke: 'rgba(235, 110, 110, 1)', glow: 'rgba(235, 110, 110, 0.5)' },       
        relationships: { stroke: 'rgba(238, 126, 177, 1)', glow: 'rgba(238, 126, 177, 0.5)' },
        freedom: { stroke: 'rgba(243, 213, 110, 1)', glow: 'rgba(243, 213, 110, 0.5)' }       
    };

    // ==========================================================================
    // INITIALIZATION & PHYSICS CORE
    // ==========================================================================
    beginButton.addEventListener("click", function () {
        startingOverlay.style.display = "none";
        
        questionSection.classList.remove("hidden");
        progressContainer.classList.remove("hidden");
        questionSection.style.display = "grid";
        progressContainer.style.display = "flex";
        
        if (!physicsInitialized) {
            initJarPhysics();
            physicsInitialized = true;
        }
        
        renderPrologueScreen();
    });

    function initJarPhysics() {
        engine = Engine.create();
        engine.gravity.y = 0.16; 

        render = Render.create({
            element: document.getElementById('matter-jar-container'),
            engine: engine,
            options: {
                width: width,
                height: height,
                wireframes: false,
                background: 'transparent'
            }
        });

        Render.run(render);
        runner = Runner.create();
        Runner.run(runner, engine);

        const jarMaterial = { isStatic: true, render: { visible: false } };
        const wallThickness = 8;
        const jarCenterX = width / 2;
        const jarCenterY = height / 2 - 10;
        const jarWidth = 340;
        const jarHeight = 560;

        const jarBottom = Bodies.rectangle(jarCenterX, jarCenterY + jarHeight/2 - 10, jarWidth - 40, wallThickness, { ...jarMaterial, chamfer: { radius: 15 } });
        const jarLeft = Bodies.rectangle(jarCenterX - jarWidth/2, jarCenterY, wallThickness, jarHeight - 80, jarMaterial);
        const jarRight = Bodies.rectangle(jarCenterX + jarWidth/2, jarCenterY, wallThickness, jarHeight - 80, jarMaterial);
        
        const jarBottomLeft = Bodies.rectangle(jarCenterX - jarWidth/2 + 25, jarCenterY + jarHeight/2 - 30, 60, 60, { ...jarMaterial, angle: Math.PI / 4 });
        const jarBottomRight = Bodies.rectangle(jarCenterX + jarWidth/2 - 25, jarCenterY + jarHeight/2 - 30, 60, 60, { ...jarMaterial, angle: -Math.PI / 4 });

        const neckLeft = Bodies.rectangle(jarCenterX - jarWidth/2 + 35, jarCenterY - jarHeight/2 + 55, 60, 40, { ...jarMaterial, angle: -Math.PI / 5 });
        const neckRight = Bodies.rectangle(jarCenterX + jarWidth/2 - 35, jarCenterY - jarHeight/2 + 55, 60, 40, { ...jarMaterial, angle: Math.PI / 5 });

        Composite.add(engine.world, [jarBottom, jarLeft, jarRight, jarBottomLeft, jarBottomRight, neckLeft, neckRight]);

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
    // SCREEN STATE INJECTORS
    // ==========================================================================
    function renderPrologueScreen() {
        isPrologueMode = true;
        isEndGameMode = false;
        mainScenarioCard.classList.add("prologue-mode");
        
        mainScenarioCard.querySelector("h1").innerText = "The Final Stretch";
        mainScenarioCard.querySelector("p").innerHTML = `You’re entering the final stretch of college life.

Things are moving forward whether you feel ready or not. Conversations start carrying more weight, opportunities feel harder to ignore, and small decisions begin to feel strangely permanent.

Over the next few weeks, you’ll navigate situations involving work, relationships, money, rest, and the pressure of figuring out what comes next. Every choice affects different parts of your life, sometimes in ways you expect and sometimes in ways you don’t.

There are no perfect choices. Only trade-offs.

<strong>The question is: what will you choose to fill your jar with?</strong>`;

        optionsContainer.classList.add("hidden");
        confirmBtn.textContent = "Begin Experience";
        confirmBtn.disabled = false;
    }

    function renderCurrentQuestion() {
        // --- ADD THIS BLOCK HERE ---
        // This ensures the 9th bar (index 8) activates when we move to the final index
        if (currentQuestionIndex === 8) { 
            if(progressBars[8]) progressBars[8].classList.add("active");
        }
        // ---------------------------

        // Check if we hit the limit
        if (currentQuestionIndex >= questionsData.length) {
            showEndGame();
            return;
        }
    
        isPrologueMode = false;
        mainScenarioCard.classList.remove("prologue-mode");
        optionsContainer.classList.remove("hidden");
    
        const currentData = questionsData[currentQuestionIndex];
        mainScenarioCard.querySelector("h1").innerText = currentData.time;
        mainScenarioCard.querySelector("p").innerText = currentData.prompt;

        cards.forEach((card, idx) => {
            const optData = currentData.options[idx];
            card.querySelector("h3").innerText = optData.title;
            card.querySelector("p").innerText = optData.text;
            card.classList.remove('selected');
        });

        selectedOptionIndex = null;
        confirmBtn.textContent = "Confirm";
        confirmBtn.disabled = true;

        progressBars.forEach((bar, idx) => {
            if (idx <= currentQuestionIndex) {
                bar.classList.add("active");
            } else {
                bar.classList.remove("active");
            }
        });
    }

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
    // COMPUTE HIGHEST SCORE MATRIX REALITY (COMBINED SINGLE-FRAME READOUT)
    // ==========================================================================
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
        });

        Events.on(engine, 'beforeUpdate', runInJarColumnSortPipeline);
    }

    function runInJarColumnSortPipeline() {
        const gameBalls = Composite.allBodies(engine.world).filter(b => b.gameProperties);
        let columnStackCounts = { career: 0, money: 0, health: 0, relationships: 0, freedom: 0 };
        

        gameBalls.forEach(ball => {
            const props = ball.gameProperties;

            if (props.phase === "sorting") {
                const cat = props.quality;
                const targetX = categoryXMap[cat];
                
                const verticalRowIndex = columnStackCounts[cat];
                const targetY = 510 - (verticalRowIndex * (ball.circleRadius * 2 + 5));
                columnStackCounts[cat]++;

                const deltaX = targetX - ball.position.x;
                const deltaY = targetY - ball.position.y;

                Body.setVelocity(ball, {
                    x: deltaX * 0.10,
                    y: deltaY * 0.10
                });

                if (Math.abs(deltaX) < 1 && Math.abs(deltaY) < 1) {
                    Body.setPosition(ball, { x: targetX, y: targetY });
                    Body.setVelocity(ball, { x: 0, y: 0 });
                    props.phase = "aligned";
                }
            }
        });

        const sortingCount = gameBalls.filter(b => b.gameProperties.phase === "sorting").length;
        if (sortingCount === 0 && gameBalls.length > 0) {
            // TRIGGER: This makes the labels appear under the columns
            document.getElementById("chart-labels").classList.remove("hidden");
            
            setTimeout(executeSlowInJarAnnihilationSequence, 800);
        }
    }

    function executeSlowInJarAnnihilationSequence() {
        const gameBalls = Composite.allBodies(engine.world).filter(b => b.gameProperties);
        const categories = ['career', 'money', 'health', 'relationships', 'freedom'];
        
        let foundPairToAnnihilate = false;

        for (let cat of categories) {
            let catBalls = gameBalls.filter(b => b.gameProperties.quality === cat && b.gameProperties.phase !== "destroyed");
            let lightOrb = catBalls.find(b => !b.gameProperties.isDark);
            let darkOrb = catBalls.find(b => b.gameProperties.isDark);

            if (lightOrb && darkOrb) {
                foundPairToAnnihilate = true;
                
                lightOrb.gameProperties.phase = "destroyed";
                darkOrb.gameProperties.phase = "destroyed";

                mainScenarioCard.querySelector("p").innerText = `Opposing actions collide... Faded choices and trade-offs neutralize each other inside your glass space.`;

                let shrinkInterval = setInterval(() => {
                    if (lightOrb.circleRadius > 3 && darkOrb.circleRadius > 3) {
                        Body.scale(lightOrb, 0.82, 0.82);
                        Body.scale(darkOrb, 0.82, 0.82);
                    } else {
                        clearInterval(shrinkInterval);
                        Composite.remove(engine.world, lightOrb);
                        Composite.remove(engine.world, darkOrb);
                        
                        setTimeout(() => {
                            realignInJarColumnHeights();
                            executeSlowInJarAnnihilationSequence();
                        }, 500);
                    }
                }, 50);

                break; 
            }
        }

        // FIXED: Combined layout screen print builds metrics list AND archetype summary simultaneously inside the expanded box frame
        if (!foundPairToAnnihilate) {
            // NOW apply the formatting and text, so it never flashes a transition card
            mainScenarioCard.classList.add("end-game-mode");
            mainScenarioCard.querySelector("h1").innerText = "Ten Years Later";
            printUnifiedFinalMetricsDashboard();
            confirmBtn.disabled = false;
        }
    }

    function realignInJarColumnHeights() {
        const categories = ['career', 'money', 'health', 'relationships', 'freedom'];
        const gameBalls = Composite.allBodies(engine.world).filter(b => b.gameProperties);

        categories.forEach(cat => {
            let columnStackIndex = 0;
            let catBalls = gameBalls.filter(b => b.gameProperties.quality === cat).sort((a,b) => b.position.y - a.position.y);
            
            catBalls.forEach(ball => {
                const targetY = 510 - (columnStackIndex * (ball.circleRadius * 2 + 5));
                Body.setPosition(ball, { x: categoryXMap[cat], y: targetY });
                columnStackIndex++;
            });
        });
    }

    function printUnifiedFinalMetricsDashboard() {
        // 1. Calculate archetype path key
        let highestScore = -Infinity;
        let dominantArchetype = "balanced";

        Object.keys(scoreTracker).forEach(trait => {
            if (scoreTracker[trait] > highestScore) {
                highestScore = scoreTracker[trait];
                dominantArchetype = trait;
            }
        });

        // If no score is significantly higher, default to balanced
        if (highestScore <= 1) {
            dominantArchetype = "balanced";
        }

        const selectedStoryOutput = futureRealitiesPreset[dominantArchetype];

        // 2. Prepare the combined string
        const dashboardHTMLString = `
            <strong>Your priority metrics scorecard:</strong><br>
            👔 Career Priority Score: <strong>${scoreTracker.career}</strong><br>
            💶 Financial Armor Score: <strong>${scoreTracker.money}</strong><br>
            ❤️ Personal Well-being Score: <strong>${scoreTracker.health}</strong><br>
            🌸 Human Connection Score: <strong>${scoreTracker.relationships}</strong><br>
            💛 Total Autonomy Score: <strong>${scoreTracker.freedom}</strong>
            
            <hr>
            
            <strong>Ten Years Later</strong><br><br>
            ${selectedStoryOutput}
        `;

        // 3. Update the UI once
        mainScenarioCard.querySelector("p").innerHTML = dashboardHTMLString;
        
        // 4. Reveal and style the card
        mainScenarioCard.classList.remove("hidden");
        mainScenarioCard.classList.add("end-game-mode");
    }



})();