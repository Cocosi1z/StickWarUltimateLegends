const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

/*
========================================================
⚔️ STICK WAR ULTIMATE LEGENDS
Backend v2026.27.8
========================================================
*/

// ======================================================
// GAME DATA
// ======================================================

const ARMORS = [
    {
        id: 1,
        name: "Volcano Dragon Armor",
        displayName: "🌋 Giáp Hỏa Long",
        description: "Giáp magma đen với dung nham đỏ rực.",
        effects: [
            "+15% Sát thương",
            "+10% Kháng sát thương vật lý",
            "Có cơ hội thiêu đốt mục tiêu"
        ],
        stats: {
            damage: 15,
            physicalResist: 10,
            burnChance: 20
        }
    },
    {
        id: 2,
        name: "Ancient Runic Armor",
        displayName: "🔵 Giáp Cổ Tự",
        description: "Giáp đá cổ khắc rune phát sáng.",
        effects: [
            "+20% Tốc độ hồi máu",
            "+15% Kháng phép",
            "Giảm hồi chiêu kỹ năng"
        ],
        stats: {
            healRate: 20,
            magicResist: 15,
            cooldownReduction: 10
        }
    },
    {
        id: 3,
        name: "Cybernetic Exosuit",
        displayName: "🟢 Giáp Công Nghệ Cyber",
        description: "Bộ khung cơ khí công nghệ cao.",
        effects: [
            "+20% Tốc độ đánh",
            "+15% Tốc độ di chuyển"
        ],
        stats: {
            attackSpeed: 20,
            moveSpeed: 15
        }
    },
    {
        id: 4,
        name: "Spectral Wraith Armor",
        displayName: "🟣 Giáp Linh Hồn",
        description: "Giáp linh hồn khiến cơ thể nửa hư nửa thực.",
        effects: [
            "+15% Né tránh",
            "-10% Máu tối đa"
        ],
        stats: {
            dodge: 15,
            maxHp: -10
        }
    },
    {
        id: 5,
        name: "Golden Pharaoh Armor",
        displayName: "🟡 Giáp Sa Mạc Hoàng Kim",
        description: "Giáp vàng phong cách Pharaoh Ai Cập.",
        effects: [
            "+25% Vàng nhận được",
            "+5% Máu"
        ],
        stats: {
            goldBonus: 25,
            maxHp: 5
        }
    },
    {
        id: 6,
        name: "Glacial Frost Armor",
        displayName: "❄️ Giáp Băng Vĩnh Cửu",
        description: "Giáp được tạo từ băng vĩnh cửu.",
        effects: [
            "+25% Máu tối đa",
            "Làm chậm địch 30%",
            "-5% Tốc độ di chuyển"
        ],
        stats: {
            maxHp: 25,
            enemySlow: 30,
            moveSpeed: -5
        }
    },
    {
        id: 7,
        name: "Toxic Chem-Suit",
        displayName: "☣️ Giáp Độc Dược",
        description: "Giáp sinh hóa với bình độc phía sau.",
        effects: [
            "Miễn nhiễm độc",
            "+10% Sát thương độc",
            "Chết tạo vùng độc"
        ],
        stats: {
            poisonImmune: true,
            poisonDamage: 10,
            deathPoison: true
        }
    },
    {
        id: 8,
        name: "Void Eclipse Armor",
        displayName: "🌌 Giáp Hư Không",
        description: "Giáp chứa một khoảng không vũ trụ.",
        effects: [
            "Mỗi 10 giây đòn tiếp theo xuyên giáp",
            "+10% Sát thương chí mạng",
            "+10% Kháng khống chế"
        ],
        stats: {
            trueDamageInterval: 10,
            critDamage: 10,
            controlResist: 10
        }
    },
    {
        id: 9,
        name: "Archangel Plate",
        displayName: "👼 Giáp Thiên Thần Hoàng Kim",
        description: "Giáp bạc với cánh vàng và hào quang.",
        effects: [
            "Hồi máu đồng minh xung quanh",
            "+15% Hiệu suất hồi máu đồng đội",
            "+10% Giáp"
        ],
        stats: {
            allyHeal: 15,
            armor: 10
        }
    },
    {
        id: 10,
        name: "Overgrown Thorn Mail",
        displayName: "🌿 Giáp Gai Đầm Lầy",
        description: "Giáp dây leo cổ thụ đầy gai.",
        effects: [
            "Phản 20% sát thương cận chiến",
            "+15% Giáp",
            "+5% Kháng hiệu ứng"
        ],
        stats: {
            reflectMelee: 20,
            armor: 15,
            controlResist: 5
        }
    }
];

// ======================================================
// SPELLS
// ======================================================

const SPELLS = [
    "Lightning",
    "Meteor",
    "Fireball",
    "Freeze",
    "Heal",
    "Rage",
    "Shield",
    "Tornado",
    "Earthquake",
    "Poison",
    "Clone",
    "Teleport",
    "Arrow Rain",
    "Darkness",
    "Thunder Storm",
    "Time Stop",
    "Stone Skin",
    "Speed",
    "Summon"
].map((name, index) => ({
    id: index + 1,
    name
}));

// ======================================================
// UNITS
// ======================================================

const UNITS = [
    "Swordwrath",
    "Archidon",
    "Spearton",
    "Magikill",
    "Giant"
].map((name, index) => ({
    id: index + 1,
    name
}));

// ======================================================
// ROYALS
// ======================================================

const ROYALS = [
    "Xiphos",
    "Kytchu",
    "Atreyos",
    "Icaron",
    "Thera",
    "Adicai"
].map((name, index) => ({
    id: index + 1,
    name
}));

// ======================================================
// CAMPAIGN - 10 MAPS
// ======================================================

const CAMPAIGN = [
    {
        id: 1,
        name: "Training Grounds",
        reward: 500
    },
    {
        id: 2,
        name: "Swordwrath Valley",
        reward: 700
    },
    {
        id: 3,
        name: "Archidon Forest",
        reward: 900
    },
    {
        id: 4,
        name: "Spearton Fortress",
        reward: 1200
    },
    {
        id: 5,
        name: "Magikill Ruins",
        reward: 1500
    },
    {
        id: 6,
        name: "Shadow Lands",
        reward: 2000
    },
    {
        id: 7,
        name: "Frozen Battlefield",
        reward: 2500
    },
    {
        id: 8,
        name: "Volcano Kingdom",
        reward: 3000
    },
    {
        id: 9,
        name: "Royal War",
        reward: 4000
    },
    {
        id: 10,
        name: "Final Battle",
        reward: 10000
    }
];

// ======================================================
// MISSIONS - 10
// ======================================================

const MISSIONS = [
    {
        id: 1,
        name: "First Battle",
        reward: 300
    },
    {
        id: 2,
        name: "Defend the Statue",
        reward: 500
    },
    {
        id: 3,
        name: "Enemy Rush",
        reward: 700
    },
    {
        id: 4,
        name: "Night Attack",
        reward: 900
    },
    {
        id: 5,
        name: "Giant Attack",
        reward: 1200
    },
    {
        id: 6,
        name: "Magic War",
        reward: 1500
    },
    {
        id: 7,
        name: "Frozen Siege",
        reward: 2000
    },
    {
        id: 8,
        name: "Volcano Assault",
        reward: 2500
    },
    {
        id: 9,
        name: "Royal Challenge",
        reward: 4000
    },
    {
        id: 10,
        name: "Ultimate Battle",
        reward: 10000
    }
];

// ======================================================
// TEMP DATABASE
// ======================================================

const accounts = [];

const codes = [];

let globalMessage =
    "Welcome to Stick War Ultimate Legends!";

// ======================================================
// CREATE ADMIN
// ======================================================

accounts.push({
    id: 1,
    username: "admin",
    password: "AdLegend2026",
    role: "admin",

    gold: 999999999,
    gems: 999999999,

    banned: false,
    permanentBan: false,

    skins: [],

    ownedArmors: ARMORS.map(a => a.id),
    equippedArmor: null,

    ownedSpells: SPELLS.map(s => s.id),
    equippedSpells: [],

    ownedUnits: UNITS.map(u => u.id),
    ownedRoyals: ROYALS.map(r => r.id),

    campaignProgress: 0,
    missionProgress: 0,

    completedCampaign: [],
    completedMissions: [],

    appeals: []
});

// ======================================================
// HELPERS
// ======================================================

function createPlayer(username, password) {
    return {
        id: accounts.length + 1,

        username,
        password,

        role: "player",

        gold: 1000,
        gems: 100,

        banned: false,
        permanentBan: false,

        skins: [],

        ownedArmors: [1],
        equippedArmor: null,

        ownedSpells: [],
        equippedSpells: [],

        ownedUnits: [1],
        ownedRoyals: [],

        campaignProgress: 0,
        missionProgress: 0,

        completedCampaign: [],
        completedMissions: [],

        appeals: []
    };
}

function publicAccount(account) {
    return {
        id: account.id,
        username: account.username,
        role: account.role,

        gold: account.gold,
        gems: account.gems,

        skins: account.skins,

        ownedArmors: account.ownedArmors,
        equippedArmor: account.equippedArmor,

        ownedSpells: account.ownedSpells,
        equippedSpells: account.equippedSpells,

        ownedUnits: account.ownedUnits,
        ownedRoyals: account.ownedRoyals,

        campaignProgress: account.campaignProgress,
        missionProgress: account.missionProgress,

        completedCampaign: account.completedCampaign,
        completedMissions: account.completedMissions
    };
}

function getAccount(id) {
    return accounts.find(
        acc => acc.id === Number(id)
    );
}

// ======================================================
// HOME
// ======================================================

app.get("/", (req, res) => {
    res.json({
        game: "Stick War Ultimate Legends",
        version: "2026.27.8",
        status: "online"
    });
});

// ======================================================
// STATUS
// ======================================================

app.get("/api/status", (req, res) => {
    res.json({
        online: true,
        game: "SWUL",
        version: "2026.27.8"
    });
});

// ======================================================
// REGISTER
// ======================================================

app.post("/api/register", (req, res) => {

    const username =
        String(req.body.username || "").trim();

    const password =
        String(req.body.password || "");

    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: "Username and password are required."
        });
    }

    if (username.length < 3) {
        return res.status(400).json({
            success: false,
            message: "Username must contain at least 3 characters."
        });
    }

    if (password.length < 6) {
        return res.status(400).json({
            success: false,
            message: "Password must contain at least 6 characters."
        });
    }

    const exists = accounts.find(
        acc =>
            acc.username.toLowerCase() ===
            username.toLowerCase()
    );

    if (exists) {
        return res.status(409).json({
            success: false,
            message: "Account already exists."
        });
    }

    const account =
        createPlayer(username, password);

    accounts.push(account);

    res.json({
        success: true,
        message: "Account created.",
        account: publicAccount(account)
    });
});

// ======================================================
// LOGIN
// ======================================================

app.post("/api/login", (req, res) => {

    const username =
        String(req.body.username || "");

    const password =
        String(req.body.password || "");

    const account = accounts.find(
        acc =>
            acc.username.toLowerCase() ===
            username.toLowerCase() &&
            acc.password === password
    );

    if (!account) {
        return res.status(401).json({
            success: false,
            message: "Invalid username or password."
        });
    }

    if (account.banned || account.permanentBan) {
        return res.status(403).json({
            success: false,
            banned: true,
            accountId: account.id,
            message: account.permanentBan
                ? "This account is permanently banned."
                : "This account is banned."
        });
    }

    res.json({
        success: true,
        account: publicAccount(account)
    });
});

// ======================================================
// GET ARMORS
// ======================================================

app.get("/api/armors", (req, res) => {

    res.json({
        success: true,
        armors: ARMORS
    });
});

// ======================================================
// EQUIP ARMOR
// ======================================================

app.post("/api/armor/equip", (req, res) => {

    const account =
        getAccount(req.body.accountId);

    const armorId =
        Number(req.body.armorId);

    if (!account) {
        return res.status(404).json({
            success: false,
            message: "Account not found."
        });
    }

    if (!account.ownedArmors.includes(armorId)) {
        return res.status(403).json({
            success: false,
            message: "Armor is not unlocked."
        });
    }

    const armor =
        ARMORS.find(a => a.id === armorId);

    account.equippedArmor = armorId;

    res.json({
        success: true,
        message: `${armor.displayName} equipped!`,
        armor,
        account: publicAccount(account)
    });
});

// ======================================================
// UNLOCK ARMOR
// ======================================================

app.post("/api/armor/unlock", (req, res) => {

    const account =
        getAccount(req.body.accountId);

    const armorId =
        Number(req.body.armorId);

    if (!account) {
        return res.status(404).json({
            success: false,
            message: "Account not found."
        });
    }

    const armor =
        ARMORS.find(a => a.id === armorId);

    if (!armor) {
        return res.status(404).json({
            success: false,
            message: "Armor not found."
        });
    }

    if (!account.ownedArmors.includes(armorId)) {
        account.ownedArmors.push(armorId);
    }

    res.json({
        success: true,
        message: `${armor.displayName} unlocked!`,
        account: publicAccount(account)
    });
});

// ======================================================
// SPELLS
// ======================================================

app.get("/api/spells", (req, res) => {

    res.json({
        success: true,
        spells: SPELLS
    });
});

// ======================================================
// EQUIP SPELL
// ======================================================

app.post("/api/spell/equip", (req, res) => {

    const account =
        getAccount(req.body.accountId);

    const spellId =
        Number(req.body.spellId);

    if (!account) {
        return res.status(404).json({
            success: false,
            message: "Account not found."
        });
    }

    if (!account.ownedSpells.includes(spellId)) {
        return res.status(403).json({
            success: false,
            message: "Spell is not unlocked."
        });
    }

    if (!account.equippedSpells.includes(spellId)) {
        account.equippedSpells.push(spellId);
    }

    res.json({
        success: true,
        message: "Spell equipped.",
        account: publicAccount(account)
    });
});

// ======================================================
// CAMPAIGN
// ======================================================

app.get("/api/campaign", (req, res) => {

    res.json({
        success: true,
        maps: CAMPAIGN
    });
});

// ======================================================
// COMPLETE CAMPAIGN MAP
// ======================================================

app.post("/api/campaign/complete", (req, res) => {

    const account =
        getAccount(req.body.accountId);

    const mapId =
        Number(req.body.mapId);

    if (!account) {
        return res.status(404).json({
            success: false,
            message: "Account not found."
        });
    }

    const map =
        CAMPAIGN.find(m => m.id === mapId);

    if (!map) {
        return res.status(404).json({
            success: false,
            message: "Campaign map not found."
        });
    }

    if (
        mapId > 1 &&
        !account.completedCampaign.includes(mapId - 1)
    ) {
        return res.status(403).json({
            success: false,
            message: "Complete the previous map first."
        });
    }

    if (!account.completedCampaign.includes(mapId)) {
        account.completedCampaign.push(mapId);
        account.gold += map.reward;
    }

    account.campaignProgress =
        account.completedCampaign.length;

    res.json({
        success: true,
        message: `Campaign ${mapId} completed!`,
        reward: map.reward,
        account: publicAccount(account)
    });
});

// ======================================================
// MISSIONS
// ======================================================

app.get("/api/missions", (req, res) => {

    res.json({
        success: true,
        missions: MISSIONS
    });
});

// ======================================================
// COMPLETE MISSION
// ======================================================

app.post("/api/mission/complete", (req, res) => {

    const account =
        getAccount(req.body.accountId);

    const missionId =
        Number(req.body.missionId);

    if (!account) {
        return res.status(404).json({
            success: false,
            message: "Account not found."
        });
    }

    const mission =
        MISSIONS.find(m => m.id === missionId);

    if (!mission) {
        return res.status(404).json({
            success: false,
            message: "Mission not found."
        });
    }

    if (
        missionId > 1 &&
        !account.completedMissions.includes(missionId - 1)
    ) {
        return res.status(403).json({
            success: false,
            message: "Complete the previous mission first."
        });
    }

    if (!account.completedMissions.includes(missionId)) {

        account.completedMissions.push(missionId);

        account.gold += mission.reward;
    }

    account.missionProgress =
        account.completedMissions.length;

    res.json({
        success: true,
        message: `Mission ${missionId} completed!`,
        reward: mission.reward,
        account: publicAccount(account)
    });
});

// ======================================================
// FINAL MISSION STATUS
// ======================================================

app.get("/api/final-mission/:accountId", (req, res) => {

    const account =
        getAccount(req.params.accountId);

    if (!account) {
        return res.status(404).json({
            success: false,
            message: "Account not found."
        });
    }

    const unlocked =
        account.missionProgress >= 9;

    res.json({
        success: true,
        unlocked,
        message: unlocked
            ? "🔥 FINAL MISSION UNLOCKED!"
            : "🔒 Complete 9 missions to unlock the final mission."
    });
});

// ======================================================
// ADMIN ACCOUNTS
// ======================================================

app.get("/api/admin/accounts", (req, res) => {

    res.json({
        success: true,

        accounts: accounts.map(acc => ({
            id: acc.id,
            username: acc.username,
            role: acc.role,
            gold: acc.gold,
            gems: acc.gems,
            banned: acc.banned,
            permanentBan: acc.permanentBan
        }))
    });
});

// ======================================================
// ADMIN BAN
// ======================================================

app.post("/api/admin/ban", (req, res) => {

    const account =
        getAccount(req.body.accountId);

    const permanent =
        Boolean(req.body.permanent);

    if (!account) {
        return res.status(404).json({
            success: false,
            message: "Account not found."
        });
    }

    if (account.role === "admin") {
        return res.status(403).json({
            success: false,
            message: "Admin accounts cannot be banned."
        });
    }

    account.banned = true;

    if (permanent) {
        account.permanentBan = true;
    }

    res.json({
        success: true,
        message: permanent
            ? "Permanent ban applied."
            : "Ban applied."
    });
});

// ======================================================
// ADMIN UNBAN
// ======================================================

app.post("/api/admin/unban", (req, res) => {

    const account =
        getAccount(req.body.accountId);

    if (!account) {
        return res.status(404).json({
            success: false,
            message: "Account not found."
        });
    }

    account.banned = false;
    account.permanentBan = false;

    res.json({
        success: true,
        message: "Account unbanned."
    });
});

// ======================================================
// ADMIN GIFT
// ======================================================

app.post("/api/admin/gift", (req, res) => {

    const account =
        getAccount(req.body.accountId);

    if (!account) {
        return res.status(404).json({
            success: false,
            message: "Account not found."
        });
    }

    const gold =
        Number(req.body.gold) || 0;

    const gems =
        Number(req.body.gems) || 0;

    const skin =
        req.body.skin || null;

    account.gold += gold;
    account.gems += gems;

    if (
        skin &&
        !account.skins.includes(skin)
    ) {
        account.skins.push(skin);
    }

    res.json({
        success: true,
        message: "Gift sent.",
        account: publicAccount(account)
    });
});

// ======================================================
// CREATE CODE
// ======================================================

app.post("/api/admin/create-code", (req, res) => {

    const code =
        String(req.body.code || "").trim();

    if (!code) {
        return res.status(400).json({
            success: false,
            message: "Code is required."
        });
    }

    const exists =
        codes.find(
            c =>
                c.code.toLowerCase() ===
                code.toLowerCase()
        );

    if (exists) {
        return res.status(409).json({
            success: false,
            message: "Code already exists."
        });
    }

    const newCode = {
        code,
        gold: Number(req.body.gold) || 0,
        gems: Number(req.body.gems) || 0,
        skin: req.body.skin || null
    };

    codes.push(newCode);

    res.json({
        success: true,
        message: "Code created.",
        code: newCode
    });
});

// ======================================================
// REDEEM CODE
// ======================================================

app.post("/api/redeem-code", (req, res) => {

    const account =
        getAccount(req.body.accountId);

    const code =
        String(req.body.code || "").trim();

    if (!account) {
        return res.status(404).json({
            success: false,
            message: "Account not found."
        });
    }

    const reward =
        codes.find(
            c =>
                c.code.toLowerCase() ===
                code.toLowerCase()
        );

    if (!reward) {
        return res.status(404).json({
            success: false,
            message: "Invalid code."
        });
    }

    account.gold += reward.gold;
    account.gems += reward.gems;

    if (
        reward.skin &&
        !account.skins.includes(reward.skin)
    ) {
        account.skins.push(reward.skin);
    }

    res.json({
        success: true,
        message: "Code redeemed!",
        rewards: {
            gold: reward.gold,
            gems: reward.gems,
            skin: reward.skin
        }
    });
});

// ======================================================
// GLOBAL MESSAGE
// ======================================================

app.get("/api/global-message", (req, res) => {

    res.json({
        success: true,
        message: globalMessage
    });
});

app.post("/api/admin/global-message", (req, res) => {

    const message =
        String(req.body.message || "").trim();

    if (!message) {
        return res.status(400).json({
            success: false,
            message: "Message cannot be empty."
        });
    }

    globalMessage = message;

    res.json({
        success: true,
        message: "Global message updated."
    });
});

// ======================================================
// LEADERBOARD
// ======================================================

app.get("/api/leaderboard", (req, res) => {

    const leaderboard =
        [...accounts]
            .filter(acc => !acc.banned)
            .sort((a, b) => b.gold - a.gold)
            .map((acc, index) => ({
                rank: index + 1,
                username: acc.username,
                gold: acc.gold,
                gems: acc.gems
            }));

    res.json({
        success: true,
        leaderboard
    });
});

// ======================================================
// ACCOUNT DATA
// ======================================================

app.get("/api/account/:id", (req, res) => {

    const account =
        getAccount(req.params.id);

    if (!account) {
        return res.status(404).json({
            success: false,
            message: "Account not found."
        });
    }

    res.json({
        success: true,
        account: publicAccount(account)
    });
});

// ======================================================
// APPEAL
// ======================================================

app.post("/api/appeal", (req, res) => {

    const account =
        getAccount(req.body.accountId);

    const message =
        String(req.body.message || "").trim();

    if (!account) {
        return res.status(404).json({
            success: false,
            message: "Account not found."
        });
    }

    if (!message) {
        return res.status(400).json({
            success: false,
            message: "Appeal message is required."
        });
    }

    account.appeals.push({
        id: account.appeals.length + 1,
        message,
        status: "pending",
        createdAt: new Date().toISOString()
    });

    res.json({
        success: true,
        message: "Appeal submitted successfully."
    });
});

// ======================================================
// ADMIN VIEW APPEALS
// ======================================================

app.get("/api/admin/appeals", (req, res) => {

    const appeals = [];

    accounts.forEach(account => {

        account.appeals.forEach(appeal => {

            appeals.push({
                accountId: account.id,
                username: account.username,
                ...appeal
            });

        });

    });

    res.json({
        success: true,
        appeals
    });
});

// ======================================================
// ADMIN RESPOND TO APPEAL
// ======================================================

app.post("/api/admin/appeal/respond", (req, res) => {

    const account =
        getAccount(req.body.accountId);

    const appealId =
        Number(req.body.appealId);

    const action =
        String(req.body.action || "");

    if (!account) {
        return res.status(404).json({
            success: false,
            message: "Account not found."
        });
    }

    const appeal =
        account.appeals.find(
            a => a.id === appealId
        );

    if (!appeal) {
        return res.status(404).json({
            success: false,
            message: "Appeal not found."
        });
    }

    if (action === "approve") {

        account.banned = false;
        account.permanentBan = false;

        appeal.status = "approved";

    } else if (action === "reject") {

        appeal.status = "rejected";

    } else {

        return res.status(400).json({
            success: false,
            message: "Action must be approve or reject."
        });
    }

    res.json({
        success: true,
        message:
            action === "approve"
                ? "Appeal approved. Account unbanned."
                : "Appeal rejected."
    });
});

// ======================================================
// GAME DATA
// ======================================================

app.get("/api/game-data", (req, res) => {

    res.json({
        success: true,

        game: {
            name: "Stick War Ultimate Legends",
            version: "2026.27.8"
        },

        units: UNITS,
        royals: ROYALS,
        armors: ARMORS,
        spells: SPELLS,
        campaign: CAMPAIGN,
        missions: MISSIONS
    });
});

// ======================================================
// 404
// ======================================================

app.use((req, res) => {

    res.status(404).json({
        success: false,
        message: "API endpoint not found.",
        path: req.path
    });
});

// ======================================================
// SERVER
// ======================================================

app.listen(PORT, () => {

    console.log("=================================");
    console.log("⚔️ SWUL BACKEND ONLINE");
    console.log("Version: 2026.27.8");
    console.log(`Port: ${PORT}`);
    console.log("Admin ID: admin");
    console.log("Admin Password: AdLegend2026");
    console.log("=================================");
});
