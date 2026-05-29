/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║                  CircleUp — Production Database Seeder              ║
 * ║                                                                      ║
 * ║  Generates a realistic social-network ecosystem for testing:         ║
 * ║  • AI matching  • Discover feed  • Friend requests  • Communities    ║
 * ║  • Chat (private & community)  • Notifications  • Search            ║
 * ║                                                                      ║
 * ║  Usage:  npm run seed                                                ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ── Models (unchanged) ────────────────────────────────────────────────────────
const User = require('../models/User');
const Community = require('../models/Community');
const Message = require('../models/Message');
const CommunityMessage = require('../models/CommunityMessage');
const Notification = require('../models/Notification');

// ═══════════════════════════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/** Deterministic seeded RNG so runs are reproducible */
function mulberry32(seed) {
    return function () {
        let t = (seed += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
const rng = mulberry32(42);

const rand = (min, max) => Math.floor(rng() * (max - min + 1)) + min;
const pick = (arr) => arr[rand(0, arr.length - 1)];
const pickN = (arr, n) => {
    const shuffled = [...arr].sort(() => rng() - 0.5);
    return shuffled.slice(0, n);
};
const randomDate = (startYear = 2023) => {
    const start = new Date(startYear, 0, 1).getTime();
    const end = new Date(2025, 4, 15).getTime();
    return new Date(start + rng() * (end - start));
};

// ═══════════════════════════════════════════════════════════════════════════════
//  DATA POOLS
// ═══════════════════════════════════════════════════════════════════════════════

// ── Names (120 unique Indian names — mix of male & female) ────────────────────
const FIRST_NAMES_MALE = [
    'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan',
    'Krishna', 'Ishaan', 'Shaurya', 'Atharva', 'Advik', 'Pranav', 'Advaith',
    'Dhruv', 'Kabir', 'Ritvik', 'Aarush', 'Kian', 'Darsh', 'Veer', 'Harsh',
    'Rohan', 'Arnav', 'Dev', 'Ravi', 'Sahil', 'Nikhil', 'Kunal', 'Ankit',
    'Rahul', 'Mohit', 'Varun', 'Tarun', 'Gaurav', 'Deepak', 'Manish', 'Vikas',
    'Akash', 'Ajay', 'Sumit', 'Neeraj', 'Rajat', 'Pankaj', 'Yash', 'Karan',
    'Laksh', 'Ishan', 'Om', 'Parth', 'Manan', 'Shreyas', 'Tanmay', 'Chirag',
    'Siddharth', 'Abhinav', 'Prateek', 'Rishab', 'Aakash',
];
const FIRST_NAMES_FEMALE = [
    'Aadhya', 'Diya', 'Saanvi', 'Ananya', 'Isha', 'Aanya', 'Myra', 'Anika',
    'Navya', 'Kiara', 'Sara', 'Priya', 'Riya', 'Neha', 'Pooja', 'Shreya',
    'Tanvi', 'Sneha', 'Kavya', 'Divya', 'Simran', 'Meera', 'Nisha', 'Anjali',
    'Sakshi', 'Kritika', 'Ishita', 'Radhika', 'Sanya', 'Tanya', 'Mahira',
    'Aria', 'Zara', 'Pihu', 'Avni', 'Mahi', 'Naina', 'Kriti', 'Palak',
    'Ridhi', 'Bhavya', 'Jiya', 'Lavanya', 'Trisha', 'Swara', 'Ahana',
    'Kashvi', 'Charvi', 'Ivana', 'Amaira', 'Ruhi', 'Mihika', 'Saisha',
    'Anvi', 'Sia', 'Nitya', 'Vanya', 'Rhea', 'Aditi', 'Mansi',
];
const LAST_NAMES = [
    'Sharma', 'Verma', 'Gupta', 'Singh', 'Kumar', 'Patel', 'Joshi', 'Mehta',
    'Shah', 'Reddy', 'Nair', 'Iyer', 'Pillai', 'Rao', 'Deshmukh', 'Patil',
    'Kulkarni', 'Banerjee', 'Chatterjee', 'Mukherjee', 'Bose', 'Sen', 'Das',
    'Agarwal', 'Jain', 'Malhotra', 'Kapoor', 'Khanna', 'Chopra', 'Bhatia',
    'Saxena', 'Tiwari', 'Pandey', 'Mishra', 'Dubey', 'Chauhan', 'Thakur',
    'Rathore', 'Yadav', 'Sinha',
];

// ── Anonymous name fragments ──────────────────────────────────────────────────
const ANON_ADJECTIVES = [
    'Silent', 'Cosmic', 'Hidden', 'Mystic', 'Neon', 'Blazing', 'Shadow',
    'Crystal', 'Electric', 'Lunar', 'Solar', 'Frosty', 'Crimson', 'Golden',
    'Velvet', 'Phantom', 'Radiant', 'Turbo', 'Pixel', 'Stealth', 'Quantum',
    'Vivid', 'Amber', 'Astral', 'Binary', 'Chrome', 'Dusk', 'Echo', 'Flux',
    'Glitch', 'Haze', 'Ivory', 'Jet', 'Karma', 'Lite', 'Mist', 'Nova',
    'Onyx', 'Prism',
];
const ANON_NOUNS = [
    'Phoenix', 'Falcon', 'Wolf', 'Panda', 'Tiger', 'Eagle', 'Lynx', 'Fox',
    'Owl', 'Raven', 'Bear', 'Hawk', 'Shark', 'Viper', 'Cobra', 'Jaguar',
    'Panther', 'Dolphin', 'Sparrow', 'Orca', 'Coyote', 'Mantis', 'Koala',
    'Otter', 'Badger', 'Gazelle', 'Heron', 'Crane', 'Robin', 'Wren',
    'Stag', 'Bison', 'Moose', 'Drake', 'Gecko', 'Finch', 'Ibis', 'Kite',
    'Lark', 'Moth',
];

// ── Primary Goals (from schema enum) ──────────────────────────────────────────
const PRIMARY_GOALS = [
    'Gym Buddy',
    'Coding Buddy',
    'Travel Partner',
    'Flatmate',
    'Relationship',
    'Friendship',
    'Networking',
];

// ── Interests / Secondary Goals (clustered for AI matching) ───────────────────
const INTEREST_CLUSTERS = {
    tech_frontend: ['React', 'Vue.js', 'Angular', 'Next.js', 'TypeScript', 'CSS', 'UI/UX', 'Tailwind CSS', 'Figma'],
    tech_backend: ['Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'REST APIs', 'GraphQL', 'Docker', 'AWS', 'DevOps'],
    tech_ai: ['AI', 'Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision', 'Python', 'TensorFlow', 'Data Science'],
    tech_general: ['DSA', 'System Design', 'Open Source', 'Git', 'Linux', 'Competitive Programming', 'Web3', 'Blockchain'],
    creative: ['Photography', 'Videography', 'Content Creation', 'Graphic Design', 'UI/UX', 'Writing', 'Blogging', 'YouTube'],
    business: ['Startups', 'Investing', 'Marketing', 'Freelancing', 'Product Management', 'Growth Hacking', 'Consulting', 'Public Speaking'],
    sports: ['Cricket', 'Football', 'Badminton', 'Table Tennis', 'Basketball', 'Running', 'Swimming', 'Cycling'],
    fitness: ['Gym', 'Yoga', 'CrossFit', 'Calisthenics', 'Martial Arts', 'Nutrition', 'Weight Training', 'Meditation'],
    lifestyle: ['Travel', 'Cooking', 'Music', 'Anime', 'Gaming', 'Reading', 'Movies', 'Podcasts', 'Hiking'],
};
const ALL_INTERESTS = [...new Set(Object.values(INTEREST_CLUSTERS).flat())];

// ── Locations ─────────────────────────────────────────────────────────────────
const LOCATIONS = [
    'Mumbai', 'Bangalore', 'Delhi', 'Pune', 'Hyderabad', 'Chennai', 'Jaipur',
    'Kolkata', 'Chandigarh', 'Ahmedabad', 'Lucknow', 'Indore', 'Bhopal',
    'Kochi', 'Goa', 'Noida', 'Gurgaon', 'Nagpur', 'Coimbatore', 'Vadodara',
];

// ── Roles / Professions ──────────────────────────────────────────────────────
const ROLES = [
    'Full Stack Developer', 'Frontend Developer', 'Backend Developer',
    'Mobile App Developer', 'Data Scientist', 'ML Engineer', 'DevOps Engineer',
    'UI/UX Designer', 'Product Manager', 'QA Engineer', 'Cloud Architect',
    'Cybersecurity Analyst', 'Technical Writer', 'Engineering Manager',
    'Startup Founder', 'Freelance Designer', 'Content Creator', 'Student',
    'Research Intern', 'Business Analyst', 'Digital Marketer', 'Graphic Designer',
    'Video Editor', 'Photographer', 'Fitness Trainer', 'College Student',
    'Software Intern', 'Open Source Contributor', 'Blockchain Developer',
    'Game Developer',
];

// ── Chat messages by context ──────────────────────────────────────────────────
const PRIVATE_MESSAGES = [
    "Hey! Saw your profile, looks like we have similar interests.",
    "Hi! Are you into React too? I'm building a side project right now.",
    "What's up? Noticed we're in the same city. Wanna grab coffee sometime?",
    "Hey, I'm looking for a coding buddy for DSA practice. Interested?",
    "Your project looks really cool! What tech stack did you use?",
    "Hi! Are you preparing for placements too?",
    "I just started learning Machine Learning. Any tips?",
    "Do you know any good coworking spaces in Bangalore?",
    "Hey! Wanna join our weekend football group?",
    "Are you going to the tech meetup this Saturday?",
    "Nice to connect! What are you working on these days?",
    "I saw you're into photography too! What camera do you use?",
    "Hey, I'm moving to Pune next month. Any flatmate tips?",
    "Do you wanna collab on a YouTube channel about tech?",
    "I'm planning a Goa trip next week. Interested?",
    "Have you tried the new GPT API? It's insane.",
    "Looking for someone to practice mock interviews with. Down?",
    "Your anime list is fire 🔥 What's your current favorite?",
    "Hey! I noticed we both love hiking. Any good trails you'd recommend?",
    "Started a small startup. Would love to pick your brain sometime!",
    "Do you play badminton? There's a court near my place.",
    "Just deployed my first full-stack app! Feeling pumped 💪",
    "Can you recommend any good podcasts about startups?",
    "Are you attending the hackathon next weekend?",
    "I'm looking for a gym partner in Mumbai. Interested?",
    "Hey, what IDE do you use? Thinking of switching to Cursor.",
    "Do you have experience with Docker? I'm stuck on something.",
    "Your blog post on system design was really helpful. Thanks!",
    "Wanna pair program on weekends? I'm learning Rust.",
    "Just finished reading Atomic Habits. Have you read it?",
    "Hey! Fellow music lover here. What genres are you into?",
    "I'm organizing a small developer meetup. Would you like to speak?",
    "Are there any good open-source projects to contribute to for beginners?",
    "Your portfolio website is sick! Did you design it yourself?",
    "I'm looking for a study buddy for cloud certifications. AWS?",
    "Hey! I see you're into Web3. What blockchain do you prefer?",
    "Do you know any good resources for learning GraphQL?",
    "Want to start a fitness challenge? 30 days, no excuses!",
    "Have you been to any tech conferences recently?",
    "I'm building a social app. Would love feedback on the MVP!",
];

const COMMUNITY_MESSAGES_POOL = {
    tech: [
        "Anyone interested in React collab? Building an open-source dashboard.",
        "Just pushed a PR to fix the auth bug. Can someone review?",
        "What's the best state management in 2025? Redux or Zustand?",
        "Has anyone deployed a Next.js app on AWS Amplify?",
        "I'm looking for feedback on my portfolio. Drop your link too!",
        "TypeScript vs JavaScript — hot take: TS is non-negotiable now.",
        "Anyone doing the 100 days of code challenge? Let's team up!",
        "Sharing my notes on system design. Link in the thread.",
        "Docker Compose tip: use profiles for dev vs prod services.",
        "Who's excited about the new Node.js release?",
        "Need help with MongoDB aggregation pipelines. Any experts here?",
        "Free resource alert: full DSA course on YouTube. Pinning the link.",
    ],
    startup: [
        "What's the best way to validate a startup idea quickly?",
        "Looking for a technical co-founder. DM me if interested!",
        "Just got into Y Combinator's startup school. Anyone else?",
        "Revenue hit ₹1L MRR! Small wins matter 🎉",
        "How do you handle equity splits with co-founders?",
        "Best tools for building an MVP in under a week?",
        "Anyone has experience with angel investors in India?",
        "Share your biggest startup failure. Let's learn from each other.",
    ],
    fitness: [
        "Morning run crew! Who's joining at 6 AM?",
        "Just hit a new PR on bench press. 80kg! 💪",
        "Protein shake recipes that actually taste good? Drop below.",
        "Anyone tried intermittent fasting? What's your experience?",
        "Yoga at sunrise is a different vibe. Try it once.",
        "Need a gym buddy in Pune. DM me!",
        "Home workout routine that actually works — sharing mine.",
        "Marathon training plan for beginners. Who's interested?",
    ],
    travel: [
        "Planning a Manali trip next month. Who's in?",
        "Budget travel tips for Goa — let's compile a list.",
        "Has anyone done the Hampta Pass trek? How was it?",
        "Best cafes in Pondicherry? I'm going next week.",
        "Solo travel tips for women in India. Please share!",
        "Road trip from Mumbai to Goa. Best pit stops?",
        "Cheapest international destinations from India? Need ideas!",
        "Sharing my Ladakh photo dump 📸",
    ],
    flatmate: [
        "Looking for flatmates in Koramangala, Bangalore. 2BHK.",
        "Anyone shifting to Pune? I need a roommate.",
        "Tips for finding reliable flatmates? Bad experiences lately 😅",
        "Flat available near Hinjewadi, Pune. DM for details.",
        "How do you split bills with roommates? Any app suggestions?",
        "Moving to Gurgaon for a new job. Need a flatmate ASAP!",
    ],
    anime: [
        "Just finished Frieren. Absolute masterpiece. 10/10.",
        "Unpopular opinion: Naruto filler arcs have some gems.",
        "Solo Leveling anime — did it live up to the manhwa?",
        "Top 5 anime soundtracks? Mine: AoT, Your Name, Demon Slayer, Haikyuu, Cowboy Bebop.",
        "Anyone reading One Piece? That last chapter was insane!",
        "Anime movie night this Friday. Voting for the movie!",
        "New season of Jujutsu Kaisen has been incredible so far.",
    ],
    design: [
        "Figma vs Framer — which do you prefer for prototyping?",
        "Sharing a free icon pack I made. Link in the thread!",
        "Color palette inspiration sites? I use Coolors and Realtime Colors.",
        "Best design system examples? I'm building one for my startup.",
        "UI audit of popular Indian apps. Thread incoming 🧵",
        "Glassmorphism is making a comeback. Thoughts?",
        "Accessibility in design is not optional. Great resource below.",
    ],
    general: [
        "Good morning everyone! What are you working on today?",
        "This community is awesome. Glad to be here!",
        "Weekend plans? Let's do something together!",
        "New here! Excited to meet everyone.",
        "Who's up for a virtual game night?",
        "Sharing a playlist for coding sessions. Spotify link below.",
    ],
};

// ── Community definitions ─────────────────────────────────────────────────────
const COMMUNITIES_DATA = [
    {
        name: 'MERN Stack Developers',
        description: 'A community for MongoDB, Express, React & Node.js developers to share projects, tips, and collab on open-source.',
        isPrivate: false,
        mustApprove: false,
        msgCategory: 'tech',
    },
    {
        name: 'Startup Builders India',
        description: 'Connect with founders, validate ideas, find co-founders, and share your startup journey. From zero to one, together.',
        isPrivate: false,
        mustApprove: false,
        msgCategory: 'startup',
    },
    {
        name: 'AI & ML Enthusiasts',
        description: 'Explore artificial intelligence and machine learning — papers, projects, tools, and career advice for the AI-curious.',
        isPrivate: false,
        mustApprove: true,
        msgCategory: 'tech',
    },
    {
        name: 'Fitness & Gym Club',
        description: 'Workout routines, nutrition plans, gym buddy matching, and fitness challenges. No excuses, just gains!',
        isPrivate: false,
        mustApprove: false,
        msgCategory: 'fitness',
    },
    {
        name: 'Travel Circle India',
        description: 'Plan trips together, share travel stories, find travel partners, and discover hidden gems across India.',
        isPrivate: false,
        mustApprove: false,
        msgCategory: 'travel',
    },
    {
        name: 'Flatmate Finder',
        description: 'Find trustworthy flatmates and roommates across major Indian cities. Verified members only.',
        isPrivate: true,
        mustApprove: true,
        msgCategory: 'flatmate',
    },
    {
        name: 'Anime & Manga Hub',
        description: 'Discuss anime, manga, light novels, and Japanese culture. Weekly watch parties and recommendation threads!',
        isPrivate: false,
        mustApprove: false,
        msgCategory: 'anime',
    },
    {
        name: 'Design & Creative Studio',
        description: 'For UI/UX designers, graphic artists, and creatives. Portfolio reviews, design challenges, and inspiration.',
        isPrivate: false,
        mustApprove: false,
        msgCategory: 'design',
    },
    {
        name: 'DSA & Interview Prep',
        description: 'Crack coding interviews together. Daily problems, mock interviews, and study groups for FAANG and beyond.',
        isPrivate: false,
        mustApprove: true,
        msgCategory: 'tech',
    },
    {
        name: 'Photography Collective',
        description: 'Share your best shots, learn editing techniques, and connect with photographers across India. Monthly photo walks!',
        isPrivate: false,
        mustApprove: false,
        msgCategory: 'general',
    },
];

// ═══════════════════════════════════════════════════════════════════════════════
//  USER GENERATION
// ═══════════════════════════════════════════════════════════════════════════════

function generateUsers(count = 120) {
    const users = [];
    const usedNames = new Set();
    const usedEmails = new Set();
    const usedAnonNames = new Set();

    // Pre-assign goals to ensure every goal has users (round-robin first pass)
    const goalAssignments = [];
    for (let i = 0; i < count; i++) {
        goalAssignments.push(PRIMARY_GOALS[i % PRIMARY_GOALS.length]);
    }
    // Shuffle to avoid predictable ordering
    goalAssignments.sort(() => rng() - 0.5);

    for (let i = 0; i < count; i++) {
        const isMale = rng() > 0.5;
        const firstNames = isMale ? FIRST_NAMES_MALE : FIRST_NAMES_FEMALE;

        // Unique name
        let fullName;
        do {
            fullName = `${pick(firstNames)} ${pick(LAST_NAMES)}`;
        } while (usedNames.has(fullName));
        usedNames.add(fullName);

        // Unique email
        const emailBase = fullName.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z.]/g, '');
        let email = `${emailBase}@gmail.com`;
        let suffix = 1;
        while (usedEmails.has(email)) {
            email = `${emailBase}${suffix}@gmail.com`;
            suffix++;
        }
        usedEmails.add(email);

        // Unique anonymous name
        let anonName;
        do {
            anonName = `${pick(ANON_ADJECTIVES)}${pick(ANON_NOUNS)}${rand(10, 99)}`;
        } while (usedAnonNames.has(anonName));
        usedAnonNames.add(anonName);

        // Interest selection — create overlapping clusters for AI matching
        const clusterKeys = Object.keys(INTEREST_CLUSTERS);
        let interests;
        if (i % 5 === 0) {
            // Every 5th user: tightly clustered (all from one cluster)
            const cluster = pick(clusterKeys);
            interests = pickN(INTEREST_CLUSTERS[cluster], rand(3, 6));
        } else if (i % 3 === 0) {
            // Every 3rd user: mixed from 2 clusters
            const c1 = pick(clusterKeys);
            const c2 = pick(clusterKeys.filter((k) => k !== c1));
            const fromC1 = pickN(INTEREST_CLUSTERS[c1], rand(2, 3));
            const fromC2 = pickN(INTEREST_CLUSTERS[c2], rand(1, 3));
            interests = [...new Set([...fromC1, ...fromC2])];
        } else {
            // General: random mix
            interests = pickN(ALL_INTERESTS, rand(3, 7));
        }

        // Profile picture — randomuser.me gives real-looking faces (0-99 per gender)
        const portraitIndex = i % 100;
        const gender = isMale ? 'men' : 'women';
        const picture = `https://randomuser.me/api/portraits/${gender}/${portraitIndex}.jpg`;

        // Randomized createdAt across 2023–2025
        const createdAt = randomDate(2023);

        users.push({
            name: fullName,
            email,
            password: 'CircleUp@2025', // will be hashed in bulk
            anonymousName: anonName,
            primaryGoal: goalAssignments[i],
            secondaryGoals: interests,
            picture,
            location: pick(LOCATIONS),
            role: pick(ROLES),
            friends: [],
            friendRequests: [],
            createdAt,
            updatedAt: createdAt,
        });
    }

    return users;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  FRIENDSHIP GENERATION
// ═══════════════════════════════════════════════════════════════════════════════

function generateFriendships(userIds) {
    const pairKey = (a, b) => (a < b ? `${a}|${b}` : `${b}|${a}`);
    const existing = new Set();
    const friendships = { accepted: [], pending: [] };

    const total = userIds.length;

    // ── Cluster friendships (users near each other in array share location/goals) ──
    for (let i = 0; i < total - 1; i++) {
        const nearCount = rand(0, 3);
        for (let j = 0; j < nearCount; j++) {
            const friendIdx = Math.min(i + rand(1, 6), total - 1);
            if (friendIdx === i) continue;
            const key = pairKey(userIds[i].toString(), userIds[friendIdx].toString());
            if (existing.has(key)) continue;
            existing.add(key);
            friendships.accepted.push([userIds[i], userIds[friendIdx]]);
        }
    }

    // ── Random friendships across the network ──
    const randomCount = rand(40, 70);
    for (let k = 0; k < randomCount; k++) {
        const a = rand(0, total - 1);
        let b = rand(0, total - 1);
        if (a === b) continue;
        const key = pairKey(userIds[a].toString(), userIds[b].toString());
        if (existing.has(key)) continue;
        existing.add(key);
        friendships.accepted.push([userIds[a], userIds[b]]);
    }

    // ── Pending friend requests ──
    const pendingCount = rand(25, 45);
    for (let k = 0; k < pendingCount; k++) {
        const a = rand(0, total - 1);
        let b = rand(0, total - 1);
        if (a === b) continue;
        const key = pairKey(userIds[a].toString(), userIds[b].toString());
        if (existing.has(key)) continue;
        existing.add(key);
        friendships.pending.push([userIds[a], userIds[b]]);
    }

    return friendships;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  MESSAGE GENERATION
// ═══════════════════════════════════════════════════════════════════════════════

function generatePrivateMessages(friendPairs, count = 200) {
    const messages = [];
    for (let i = 0; i < count; i++) {
        const pair = pick(friendPairs);
        const isReverse = rng() > 0.5;
        const sender = isReverse ? pair[1] : pair[0];
        const receiver = isReverse ? pair[0] : pair[1];

        const baseTime = randomDate(2024);
        messages.push({
            sender,
            receiver,
            message: pick(PRIVATE_MESSAGES),
            createdAt: baseTime,
            updatedAt: baseTime,
        });
    }
    // Sort chronologically for realism
    messages.sort((a, b) => a.createdAt - b.createdAt);
    return messages;
}

function generateCommunityMessages(communities, memberMap, countPerCommunity = 15) {
    const messages = [];
    for (const community of communities) {
        const members = memberMap.get(community._id.toString()) || [];
        if (members.length === 0) continue;

        const category = community._msgCategory || 'general';
        const pool = COMMUNITY_MESSAGES_POOL[category] || COMMUNITY_MESSAGES_POOL.general;

        const msgCount = rand(8, countPerCommunity);
        for (let i = 0; i < msgCount; i++) {
            const baseTime = randomDate(2024);
            messages.push({
                community: community._id,
                sender: pick(members),
                message: pick(pool),
                createdAt: baseTime,
                updatedAt: baseTime,
            });
        }
    }
    messages.sort((a, b) => a.createdAt - b.createdAt);
    return messages;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  NOTIFICATION GENERATION
// ═══════════════════════════════════════════════════════════════════════════════

function generateNotifications(
    acceptedPairs,
    pendingPairs,
    communities,
    memberMap,
    userDocs
) {
    const notifications = [];
    const userNameMap = new Map();
    for (const u of userDocs) {
        userNameMap.set(u._id.toString(), u.anonymousName || u.name);
    }
    const communityNameMap = new Map();
    for (const c of communities) {
        communityNameMap.set(c._id.toString(), c.name);
    }

    // Friend request notifications (from pending pairs)
    for (const [from, to] of pendingPairs) {
        const name = userNameMap.get(from.toString()) || 'Someone';
        notifications.push({
            recipient: to,
            sender: from,
            type: 'FRIEND_REQUEST',
            referenceId: from,
            message: `${name} sent you a friend request.`,
            isRead: rng() > 0.6,
            createdAt: randomDate(2024),
        });
    }

    // Accepted friend notifications (subset of accepted pairs)
    const acceptedNotifCount = Math.min(acceptedPairs.length, 40);
    for (let i = 0; i < acceptedNotifCount; i++) {
        const [userA, userB] = acceptedPairs[i];
        const name = userNameMap.get(userB.toString()) || 'Someone';
        notifications.push({
            recipient: userA,
            sender: userB,
            type: 'FRIEND_ACCEPTED',
            referenceId: userB,
            message: `${name} accepted your friend request!`,
            isRead: rng() > 0.4,
            createdAt: randomDate(2024),
        });
    }

    // Community join notifications
    for (const community of communities) {
        if (!community.mustApprove) continue;
        const members = memberMap.get(community._id.toString()) || [];
        const admins = community.members
            .filter((m) => m.role === 'admin')
            .map((m) => m.user);
        if (admins.length === 0 || members.length === 0) continue;

        const notifCount = rand(2, 5);
        for (let i = 0; i < notifCount && i < members.length; i++) {
            const communityName = communityNameMap.get(community._id.toString());
            const memberName = userNameMap.get(members[i].toString()) || 'A user';
            notifications.push({
                recipient: admins[0],
                sender: members[i],
                type: 'COMMUNITY_JOIN_REQUEST',
                referenceId: community._id,
                message: `${memberName} requested to join ${communityName}.`,
                isRead: rng() > 0.5,
                createdAt: randomDate(2024),
            });
        }
    }

    return notifications;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  MAIN SEED FUNCTION
// ═══════════════════════════════════════════════════════════════════════════════

async function seed() {
    const startTime = Date.now();
    console.log('\n╔══════════════════════════════════════════════════════╗');
    console.log('║         CircleUp Database Seeder v1.0                ║');
    console.log('╚══════════════════════════════════════════════════════╝\n');

    // ── Connect ───────────────────────────────────────────────────────────────
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        console.error('❌  DATABASE_URL is not defined in .env');
        process.exit(1);
    }

    console.log('🔌  Connecting to MongoDB...');
    await mongoose.connect(dbUrl);
    console.log('✅  Connected to MongoDB\n');

    try {
        // ── Drop existing data ────────────────────────────────────────────────
        console.log('🗑️   Clearing existing data...');
        await Promise.all([
            User.deleteMany({}),
            Community.deleteMany({}),
            Message.deleteMany({}),
            CommunityMessage.deleteMany({}),
            Notification.deleteMany({}),
        ]);
        console.log('✅  All collections cleared\n');

        // ══════════════════════════════════════════════════════════════════════
        //  1. USERS
        // ══════════════════════════════════════════════════════════════════════
        console.log('👤  Generating users...');
        const rawUsers = generateUsers(120);

        // Hash password once and reuse (all seed users share the same password)
        const hashedPassword = await bcrypt.hash('CircleUp@2025', 12);
        const usersToInsert = rawUsers.map((u) => ({
            ...u,
            password: hashedPassword,
        }));

        const insertedUsers = await User.insertMany(usersToInsert);
        const userIds = insertedUsers.map((u) => u._id);
        console.log(`✅  ${insertedUsers.length} users created`);

        // Goal distribution report
        const goalCounts = {};
        insertedUsers.forEach((u) => {
            goalCounts[u.primaryGoal] = (goalCounts[u.primaryGoal] || 0) + 1;
        });
        console.log('   📊 Goal distribution:');
        Object.entries(goalCounts)
            .sort((a, b) => b[1] - a[1])
            .forEach(([goal, count]) => {
                console.log(`      • ${goal}: ${count} users`);
            });

        // Location distribution
        const locCounts = {};
        insertedUsers.forEach((u) => {
            locCounts[u.location] = (locCounts[u.location] || 0) + 1;
        });
        console.log(`   📍 Users spread across ${Object.keys(locCounts).length} cities\n`);

        // ══════════════════════════════════════════════════════════════════════
        //  2. COMMUNITIES
        // ══════════════════════════════════════════════════════════════════════
        console.log('🏘️   Generating communities...');
        const communityDocs = [];
        const memberMap = new Map(); // communityId -> [userId]

        for (const cData of COMMUNITIES_DATA) {
            const adminUser = pick(userIds);
            const memberCount = rand(12, 35);
            const memberUserIds = pickN(
                userIds.filter((id) => !id.equals(adminUser)),
                memberCount
            );

            const members = [
                { user: adminUser, role: 'admin', joinedAt: randomDate(2023) },
                ...memberUserIds.map((uid) => ({
                    user: uid,
                    role: 'member',
                    joinedAt: randomDate(2024),
                })),
            ];

            // Join requests for communities that require approval
            const joinRequestUsers = cData.mustApprove
                ? pickN(
                      userIds.filter(
                          (id) =>
                              !id.equals(adminUser) &&
                              !memberUserIds.some((mid) => mid.equals(id))
                      ),
                      rand(3, 8)
                  )
                : [];

            const createdAt = randomDate(2023);
            const doc = await Community.create({
                name: cData.name,
                description: cData.description,
                members,
                isPrivate: cData.isPrivate,
                mustApprove: cData.mustApprove,
                joinRequests: joinRequestUsers,
                createdAt,
                updatedAt: createdAt,
            });

            // Store msg category for later use (not persisted)
            doc._msgCategory = cData.msgCategory;
            communityDocs.push(doc);
            memberMap.set(
                doc._id.toString(),
                members.map((m) => m.user)
            );
        }
        console.log(`✅  ${communityDocs.length} communities created`);
        communityDocs.forEach((c) => {
            const memberCount = c.members.length;
            const joinReqCount = c.joinRequests.length;
            const privacy = c.isPrivate ? '🔒 Private' : '🌐 Public';
            const approval = c.mustApprove ? '(requires approval)' : '';
            console.log(
                `      • ${c.name}: ${memberCount} members, ${joinReqCount} join requests ${privacy} ${approval}`
            );
        });
        console.log('');

        // ══════════════════════════════════════════════════════════════════════
        //  3. FRIENDSHIPS
        // ══════════════════════════════════════════════════════════════════════
        console.log('👥  Generating friendships...');
        const friendships = generateFriendships(userIds);

        // Apply accepted friendships (bidirectional)
        const friendOps = [];
        for (const [userA, userB] of friendships.accepted) {
            friendOps.push(
                User.updateOne(
                    { _id: userA },
                    {
                        $push: {
                            friends: { friend: userB, accepted: true, showName: rng() > 0.5, showButton: true, wantsToShowName: rng() > 0.5 },
                        },
                    }
                ),
                User.updateOne(
                    { _id: userB },
                    {
                        $push: {
                            friends: { friend: userA, accepted: true, showName: rng() > 0.5, showButton: true, wantsToShowName: rng() > 0.5 },
                        },
                    }
                )
            );
        }

        // Apply pending friend requests
        for (const [from, to] of friendships.pending) {
            friendOps.push(
                User.updateOne(
                    { _id: to },
                    {
                        $push: {
                            friendRequests: {
                                from,
                                status: 'pending',
                                createdAt: randomDate(2024),
                            },
                        },
                    }
                )
            );
        }

        await Promise.all(friendOps);
        console.log(`✅  ${friendships.accepted.length} accepted friendships`);
        console.log(`✅  ${friendships.pending.length} pending friend requests\n`);

        // ══════════════════════════════════════════════════════════════════════
        //  4. PRIVATE MESSAGES
        // ══════════════════════════════════════════════════════════════════════
        console.log('💬  Generating private messages...');
        const privateMessages = generatePrivateMessages(
            friendships.accepted,
            rand(180, 250)
        );
        const insertedMessages = await Message.insertMany(privateMessages);
        console.log(`✅  ${insertedMessages.length} private messages created\n`);

        // ══════════════════════════════════════════════════════════════════════
        //  5. COMMUNITY MESSAGES
        // ══════════════════════════════════════════════════════════════════════
        console.log('📢  Generating community messages...');
        const communityMessages = generateCommunityMessages(
            communityDocs,
            memberMap,
            18
        );
        const insertedCommunityMessages = await CommunityMessage.insertMany(
            communityMessages
        );
        console.log(
            `✅  ${insertedCommunityMessages.length} community messages created\n`
        );

        // ══════════════════════════════════════════════════════════════════════
        //  6. NOTIFICATIONS
        // ══════════════════════════════════════════════════════════════════════
        console.log('🔔  Generating notifications...');
        const notifs = generateNotifications(
            friendships.accepted,
            friendships.pending,
            communityDocs,
            memberMap,
            insertedUsers
        );
        const insertedNotifs = await Notification.insertMany(notifs);
        console.log(`✅  ${insertedNotifs.length} notifications created\n`);

        // ══════════════════════════════════════════════════════════════════════
        //  SUMMARY
        // ══════════════════════════════════════════════════════════════════════
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log('╔══════════════════════════════════════════════════════╗');
        console.log('║                   SEED COMPLETE ✅                   ║');
        console.log('╠══════════════════════════════════════════════════════╣');
        console.log(`║  👤 Users:               ${String(insertedUsers.length).padStart(6)}                  ║`);
        console.log(`║  🏘️  Communities:          ${String(communityDocs.length).padStart(6)}                  ║`);
        console.log(`║  👥 Friendships:          ${String(friendships.accepted.length).padStart(6)}                  ║`);
        console.log(`║  📨 Pending Requests:     ${String(friendships.pending.length).padStart(6)}                  ║`);
        console.log(`║  💬 Private Messages:     ${String(insertedMessages.length).padStart(6)}                  ║`);
        console.log(`║  📢 Community Messages:   ${String(insertedCommunityMessages.length).padStart(6)}                  ║`);
        console.log(`║  🔔 Notifications:        ${String(insertedNotifs.length).padStart(6)}                  ║`);
        console.log(`║  ⏱️  Time:              ${elapsed.padStart(7)}s                  ║`);
        console.log('╚══════════════════════════════════════════════════════╝');
        console.log('\n🔑  Login with any user email + password: CircleUp@2025\n');
    } catch (error) {
        console.error('\n❌  Seed failed:', error.message);
        console.error(error.stack);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('🔌  MongoDB connection closed.');
    }
}

// ── Execute ───────────────────────────────────────────────────────────────────
seed();
