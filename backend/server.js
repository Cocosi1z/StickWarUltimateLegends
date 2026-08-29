const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();

const PORT = Number(process.env.PORT) || 3000;

const ROOT_DIR = path.join(__dirname, "..");
const DATA_DIR = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "accounts.json");
const APPEALS_FILE = path.join(DATA_DIR, "appeals.json");
const SERVER_FILE = path.join(DATA_DIR, "server.json");

/*
============================================================
CONFIG
============================================================
*/

const ADMIN_USERNAME =
    process.env.ADMIN_USERNAME || "admin";

const ADMIN_PASSWORD =
    process.env.ADMIN_PASSWORD || "AdLegend2026";

/*
============================================================
MIDDLEWARE
============================================================
*/

app.disable("x-powered-by");

app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: false }));

/*
============================================================
DATA
============================================================
*/

function ensureDataFiles() {

    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(DATA_FILE)) {
        writeJson(DATA_FILE, []);
    }

    if (!fs.existsSync(APPEALS_FILE)) {
        writeJson(APPEALS_FILE, []);
    }

    if (!fs.existsSync(SERVER_FILE)) {
        writeJson(SERVER_FILE, {
            globalMessage: "",
            version: "2026.27.8"
        });
    }
}

function readJson(file, fallback) {

    try {

        if (!fs.existsSync(file)) {
            return fallback;
        }

        const text = fs.readFileSync(file, "utf8");

        if (!text.trim()) {
            return fallback;
        }

        return JSON.parse(text);

    } catch (error) {

        console.error(
            "JSON read error:",
            file,
            error.message
        );

        return fallback;
    }
}

function writeJson(file, data) {

    fs.writeFileSync(
        file,
        JSON.stringify(data, null, 2),
        "utf8"
    );
}

ensureDataFiles();

/*
============================================================
DATABASE HELPERS
============================================================
*/

function getAccounts() {
    return readJson(DATA_FILE, []);
}

function saveAccounts(accounts) {
    writeJson(DATA_FILE, accounts);
}

function getAppeals() {
    return readJson(APPEALS_FILE, []);
}

function saveAppeals(appeals) {
    writeJson(APPEALS_FILE, appeals);
}

function getServerData() {
    return readJson(SERVER_FILE, {
        globalMessage: "",
        version: "2026.27.8"
    });
}

function saveServerData(data) {
    writeJson(SERVER_FILE, data);
}

/*
============================================================
PASSWORD
============================================================
*/

function hashPassword(password) {

    return crypto
        .createHash("sha256")
        .update(String(password))
        .digest("hex");
}

/*
============================================================
ID
============================================================
*/

function nextAccountId(accounts) {

    if (!accounts.length) {
        return 1;
    }

    return (
        Math.max(
            ...accounts.map(
                a => Number(a.id) || 0
            )
        ) + 1
    );
}

function nextAppealId(appeals) {

    if (!appeals.length) {
        return 1;
    }

    return (
        Math.max(
            ...appeals.map(
                a => Number(a.id) || 0
            )
        ) + 1
    );
}

/*
============================================================
DEFAULT ACCOUNT
============================================================
*/

function createAccount(
    id,
    username,
    password,
    role = "player"
) {

    return {
        id,
        username,
        passwordHash: hashPassword(password),

        role,

        gold: role === "admin"
            ? 999999999
            : 1000,

        gems: role === "admin"
            ? 999999999
            : 100,

        completedCampaign: [],
        completedMissions: [],

        ownedArmors: [1],
        equippedArmor: 1,

        ownedSpells: [],
        equippedSpells: [],

        redeemedCodes: [],

        banned: false,

        createdAt: new Date().toISOString()
    };
}

/*
============================================================
ADMIN BOOTSTRAP
============================================================
*/

function ensureAdmin() {

    const accounts = getAccounts();

    let admin = accounts.find(
        account =>
            account.username.toLowerCase() ===
            ADMIN_USERNAME.toLowerCase()
    );

    if (!admin) {

        const newAdmin =
            createAccount(
                nextAccountId(accounts),
                ADMIN_USERNAME,
                ADMIN_PASSWORD,
                "admin"
            );

        accounts.push(newAdmin);

        saveAccounts(accounts);

        console.log(
            `Created admin account: ${ADMIN_USERNAME}`
        );

    } else {

        /*
        Không ghi đè password mỗi lần server restart.
        */

        if (admin.role !== "admin") {
            admin.role = "admin";
            saveAccounts(accounts);
        }
    }
}

ensureAdmin();

/*
============================================================
GAME DATA
============================================================
*/

const GAME_DATA = {

    version: "2026.27.8",

    units: [
        {
            id: 1,
            name: "Swordwrath",
            cost: 100
        },
        {
            id: 2,
            name: "Archidon",
            cost: 150
        },
        {
            id: 3,
            name: "Spearton",
            cost: 250
        },
        {
            id: 4,
            name: "Magikill",
            cost: 500
        },
        {
            id: 5,
            name: "Giant",
            cost: 1000
        }
    ],

    royals: [
        {
            id: 1,
            name: "Xiphos",
            cost: 1000
        },
        {
            id: 2,
            name: "Kytchu",
            cost: 1000
        },
        {
            id: 3,
            name: "Atreyos",
            cost: 1200
        },
        {
            id: 4,
            name: "Icaron",
            cost: 1400
        },
        {
            id: 5,
            name: "Thera",
            cost: 1600
        },
        {
            id: 6,
            name: "Adicai",
            cost: 1800
        }
    ],

    campaign: Array.from(
        { length: 20 },
        (_, index) => ({
            id: index + 1,
            name: `Campaign ${index + 1}`,
            reward: 500 + index * 250
        })
    ),

    missions: Array.from(
        { length: 30 },
        (_, index) => ({
            id: index + 1,
            name: `Mission ${index + 1}`,
            reward: 250 + index * 100
        })
    ),

    armors: [
        {
            id: 1,
            displayName: "Iron Armor",
            cost: 0,
            description: "Bộ giáp cơ bản.",
            effects: [
                "+5% phòng thủ"
            ]
        },
        {
            id: 2,
            displayName: "Knight Armor",
            cost: 2500,
            description: "Giáp hiệp sĩ chắc chắn.",
            effects: [
                "+15% phòng thủ",
                "+5% máu"
            ]
        },
        {
            id: 3,
            displayName: "Dragon Armor",
            cost: 7500,
            description: "Giáp rồng huyền thoại.",
            effects: [
                "+25% phòng thủ",
                "+10% sát thương"
            ]
        },
        {
            id: 4,
            displayName: "Shadow Armor",
            cost: 12000,
            description: "Giáp bóng tối.",
            effects: [
                "+20% né tránh",
                "+15% sát thương"
            ]
        },
        {
            id: 5,
            displayName: "Royal Armor",
            cost: 20000,
            description: "Trang bị hoàng gia.",
            effects: [
                "+35% phòng thủ",
                "+20% máu"
            ]
        },
        {
            id: 6,
            displayName: "Titan Armor",
            cost: 50000,
            description: "Bộ giáp Titan cực mạnh.",
            effects: [
                "+50% phòng thủ",
                "+30% máu",
                "+20% sát thương"
            ]
        }
    ],

    spells: [
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
    ].map(
        (name, index) => ({
            id: index + 1,
            name
        })
    )
};

/*
============================================================
REDEEM CODES
============================================================
*/

const REDEEM_CODES = {

    "WELCOME2026": {
        gold: 5000,
        gems: 500
    },

    "SWUL2026": {
        gold: 10000,
        gems: 1000
    },

    "LEGENDS": {
        gold: 25000,
        gems: 2500
    }

};

/*
============================================================
ACCOUNT RESPONSE
============================================================
*/

function publicAccount(account) {

    if (!account) {
        return null;
    }

    return {
        id: account.id,
        username: account.username,
        role: account.role,

        gold: account.gold,
        gems: account.gems,

        completedCampaign:
            Array.isArray(account.completedCampaign)
                ? account.completedCampaign
                : [],

        completedMissions:
            Array.isArray(account.completedMissions)
                ? account.completedMissions
                : [],

        ownedArmors:
            Array.isArray(account.ownedArmors)
                ? account.ownedArmors
                : [],

        equippedArmor:
            account.equippedArmor ?? null,

        ownedSpells:
            Array.isArray(account.ownedSpells)
                ? account.ownedSpells
                : [],

        equippedSpells:
            Array.isArray(account.equippedSpells)
                ? account.equippedSpells
                : [],

        banned: Boolean(account.banned),

        createdAt: account.createdAt
    };
}

/*
============================================================
VALIDATION
============================================================
*/

function validUsername(username) {

    return (
        typeof username === "string" &&
        /^[A-Za-z0-9_]{3,20}$/.test(username)
    );
}

function validPassword(password) {

    return (
        typeof password === "string" &&
        password.length >= 4 &&
        password.length <= 100
    );
}

function getAccountById(id) {

    const accounts = getAccounts();

    return accounts.find(
        account =>
            Number(account.id) === Number(id)
    );
}

function getAdmin(req) {

    const id =
        Number(req.body.accountId) ||
        Number(req.query.accountId);

    if (!id) {
        return null;
    }

    const account =
        getAccountById(id);

    if (
        !account ||
        account.role !== "admin"
    ) {
        return null;
    }

    return account;
}

/*
============================================================
HEALTH
============================================================
*/

app.get("/api/health", (req, res) => {

    res.json({
        success: true,
        server: "online",
        version: GAME_DATA.version,
        time: new Date().toISOString()
    });

});

/*
============================================================
GAME DATA
============================================================
*/

app.get("/api/game-data", (req, res) => {

    res.json({
        success: true,
        version: GAME_DATA.version,

        units: GAME_DATA.units,
        royals: GAME_DATA.royals,
        campaign: GAME_DATA.campaign,
        missions: GAME_DATA.missions,
        armors: GAME_DATA.armors,
        spells: GAME_DATA.spells
    });

});

/*
============================================================
REGISTER
============================================================
*/

app.post("/api/register", (req, res) => {

    const username =
        String(req.body.username || "").trim();

    const password =
        String(req.body.password || "");

    if (!validUsername(username)) {

        return res.status(400).json({
            success: false,
            message:
                "Tên tài khoản phải dài 3-20 ký tự và chỉ gồm chữ, số hoặc _."
        });
    }

    if (!validPassword(password)) {

        return res.status(400).json({
            success: false,
            message:
                "Mật khẩu phải có ít nhất 4 ký tự."
        });
    }

    const accounts = getAccounts();

    const exists =
        accounts.some(
            account =>
                account.username.toLowerCase() ===
                username.toLowerCase()
        );

    if (exists) {

        return res.status(409).json({
            success: false,
            message:
                "Tên tài khoản đã tồn tại."
        });
    }

    const account =
        createAccount(
            nextAccountId(accounts),
            username,
            password,
            "player"
        );

    accounts.push(account);

    saveAccounts(accounts);

    return res.json({
        success: true,
        message: "Tạo tài khoản thành công.",
        account: publicAccount(account)
    });

});

/*
============================================================
LOGIN
============================================================
*/

app.post("/api/login", (req, res) => {

    const username =
        String(req.body.username || "").trim();

    const password =
        String(req.body.password || "");

    const accounts = getAccounts();

    const account =
        accounts.find(
            a =>
                a.username.toLowerCase() ===
                username.toLowerCase()
        );

    if (!account) {

        return res.status(401).json({
            success: false,
            message:
                "Sai tên tài khoản hoặc mật khẩu."
        });
    }

    if (
        account.passwordHash !==
        hashPassword(password)
    ) {

        return res.status(401).json({
            success: false,
            message:
                "Sai tên tài khoản hoặc mật khẩu."
        });
    }

    if (account.banned) {

        return res.status(403).json({
            success: false,
            message:
                "Tài khoản của bạn đang bị ban."
        });
    }

    return res.json({
        success: true,
        message: "Đăng nhập thành công.",
        account: publicAccount(account)
    });

});

/*
============================================================
ACCOUNT
============================================================
*/

app.get("/api/account/:id", (req, res) => {

    const account =
        getAccountById(req.params.id);

    if (!account) {

        return res.status(404).json({
            success: false,
            message:
                "Không tìm thấy tài khoản."
        });
    }

    if (account.banned) {

        return res.status(403).json({
            success: false,
            message:
                "Tài khoản đang bị ban."
        });
    }

    return res.json({
        success: true,
        account: publicAccount(account)
    });

});

/*
============================================================
CAMPAIGN COMPLETE
============================================================
*/

app.post(
    "/api/campaign/complete",
    (req, res) => {

        const accountId =
            Number(req.body.accountId);

        const mapId =
            Number(req.body.mapId);

        const accounts = getAccounts();

        const account =
            accounts.find(
                a =>
                    Number(a.id) ===
                    accountId
            );

        if (!account) {

            return res.status(404).json({
                success: false,
                message:
                    "Không tìm thấy tài khoản."
            });
        }

        if (account.banned) {

            return res.status(403).json({
                success: false,
                message:
                    "Tài khoản đang bị ban."
            });
        }

        const campaign =
            GAME_DATA.campaign.find(
                c => c.id === mapId
            );

        if (!campaign) {

            return res.status(404).json({
                success: false,
                message:
                    "Campaign không tồn tại."
            });
        }

        if (
            account.completedCampaign.includes(
                mapId
            )
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Campaign đã hoàn thành."
            });
        }

        if (
            mapId > 1 &&
            !account.completedCampaign.includes(
                mapId - 1
            )
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Bạn phải hoàn thành campaign trước."
            });
        }

        account.completedCampaign.push(mapId);

        account.gold += campaign.reward;

        saveAccounts(accounts);

        return res.json({
            success: true,
            reward: campaign.reward,
            account: publicAccount(account)
        });

    }
);

/*
============================================================
MISSION COMPLETE
============================================================
*/

app.post(
    "/api/mission/complete",
    (req, res) => {

        const accountId =
            Number(req.body.accountId);

        const missionId =
            Number(req.body.missionId);

        const accounts = getAccounts();

        const account =
            accounts.find(
                a =>
                    Number(a.id) ===
                    accountId
            );

        if (!account) {

            return res.status(404).json({
                success: false,
                message:
                    "Không tìm thấy tài khoản."
            });
        }

        const mission =
            GAME_DATA.missions.find(
                m => m.id === missionId
            );

        if (!mission) {

            return res.status(404).json({
                success: false,
                message:
                    "Mission không tồn tại."
            });
        }

        if (
            account.completedMissions.includes(
                missionId
            )
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Mission đã hoàn thành."
            });
        }

        if (
            missionId > 1 &&
            !account.completedMissions.includes(
                missionId - 1
            )
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Bạn phải hoàn thành mission trước."
            });
        }

        account.completedMissions.push(
            missionId
        );

        account.gold += mission.reward;

        saveAccounts(accounts);

        return res.json({
            success: true,
            reward: mission.reward,
            account: publicAccount(account)
        });

    }
);

/*
============================================================
ARMOR UNLOCK
============================================================
*/

app.post(
    "/api/armor/unlock",
    (req, res) => {

        const accountId =
            Number(req.body.accountId);

        const armorId =
            Number(req.body.armorId);

        const accounts = getAccounts();

        const account =
            accounts.find(
                a =>
                    Number(a.id) ===
                    accountId
            );

        if (!account) {

            return res.status(404).json({
                success: false,
                message:
                    "Không tìm thấy tài khoản."
            });
        }

        const armor =
            GAME_DATA.armors.find(
                a => a.id === armorId
            );

        if (!armor) {

            return res.status(404).json({
                success: false,
                message:
                    "Armor không tồn tại."
            });
        }

        if (
            account.ownedArmors.includes(
                armorId
            )
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Bạn đã sở hữu armor này."
            });
        }

        if (account.gold < armor.cost) {

            return res.status(400).json({
                success: false,
                message:
                    "Không đủ Gold."
            });
        }

        account.gold -= armor.cost;

        account.ownedArmors.push(
            armorId
        );

        saveAccounts(accounts);

        return res.json({
            success: true,
            armor,
            account: publicAccount(account)
        });

    }
);

/*
============================================================
ARMOR EQUIP
============================================================
*/

app.post(
    "/api/armor/equip",
    (req, res) => {

        const accountId =
            Number(req.body.accountId);

        const armorId =
            Number(req.body.armorId);

        const accounts = getAccounts();

        const account =
            accounts.find(
                a =>
                    Number(a.id) ===
                    accountId
            );

        if (!account) {

            return res.status(404).json({
                success: false,
                message:
                    "Không tìm thấy tài khoản."
            });
        }

        if (
            !account.ownedArmors.includes(
                armorId
            )
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Bạn chưa sở hữu armor này."
            });
        }

        const armor =
            GAME_DATA.armors.find(
                a => a.id === armorId
            );

        if (!armor) {

            return res.status(404).json({
                success: false,
                message:
                    "Armor không tồn tại."
            });
        }

        account.equippedArmor =
            armorId;

        saveAccounts(accounts);

        return res.json({
            success: true,
            armor,
            account: publicAccount(account)
        });

    }
);

/*
============================================================
SPELL UNLOCK
============================================================
*/

app.post(
    "/api/spell/unlock",
    (req, res) => {

        const accountId =
            Number(req.body.accountId);

        const spellId =
            Number(req.body.spellId);

        const accounts = getAccounts();

        const account =
            accounts.find(
                a =>
                    Number(a.id) ===
                    accountId
            );

        if (!account) {

            return res.status(404).json({
                success: false,
                message:
                    "Không tìm thấy tài khoản."
            });
        }

        const spell =
            GAME_DATA.spells.find(
                s => s.id === spellId
            );

        if (!spell) {

            return res.status(404).json({
                success: false,
                message:
                    "Spell không tồn tại."
            });
        }

        if (
            account.ownedSpells.includes(
                spellId
            )
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Bạn đã sở hữu spell này."
            });
        }

        const cost =
            spellId * 1000;

        if (account.gold < cost) {

            return res.status(400).json({
                success: false,
                message:
                    "Không đủ Gold."
            });
        }

        account.gold -= cost;

        account.ownedSpells.push(
            spellId
        );

        saveAccounts(accounts);

        return res.json({
            success: true,
            spell,
            account: publicAccount(account)
        });

    }
);

/*
============================================================
SPELL EQUIP
============================================================
*/

app.post(
    "/api/spell/equip",
    (req, res) => {

        const accountId =
            Number(req.body.accountId);

        const spellId =
            Number(req.body.spellId);

        const accounts = getAccounts();

        const account =
            accounts.find(
                a =>
                    Number(a.id) ===
                    accountId
            );

        if (!account) {

            return res.status(404).json({
                success: false,
                message:
                    "Không tìm thấy tài khoản."
            });
        }

        if (
            !account.ownedSpells.includes(
                spellId
            )
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Bạn chưa sở hữu spell."
            });
        }

        const spell =
            GAME_DATA.spells.find(
                s => s.id === spellId
            );

        if (!spell) {

            return res.status(404).json({
                success: false,
                message:
                    "Spell không tồn tại."
            });
        }

        if (
            !account.equippedSpells.includes(
                spellId
            )
        ) {

            account.equippedSpells.push(
                spellId
            );
        }

        /*
        Tối đa 5 spell trang bị.
        */

        if (
            account.equippedSpells.length > 5
        ) {

            account.equippedSpells =
                account.equippedSpells.slice(-5);
        }

        saveAccounts(accounts);

        return res.json({
            success: true,
            spell,
            account: publicAccount(account)
        });

    }
);

/*
============================================================
LEADERBOARD
============================================================
*/

app.get(
    "/api/leaderboard",
    (req, res) => {

        const accounts =
            getAccounts()
            .filter(
                a => !a.banned
            )
            .sort(
                (a, b) =>
                    Number(b.gold) -
                    Number(a.gold)
            )
            .slice(0, 100);

        const leaderboard =
            accounts.map(
                (account, index) => ({
                    rank: index + 1,
                    username:
                        account.username,
                    gold:
                        account.gold,
                    gems:
                        account.gems
                })
            );

        return res.json({
            success: true,
            leaderboard
        });

    }
);

/*
============================================================
REDEEM CODE
============================================================
*/

app.post(
    "/api/redeem-code",
    (req, res) => {

        const accountId =
            Number(req.body.accountId);

        const code =
            String(
                req.body.code || ""
            )
            .trim()
            .toUpperCase();

        const accounts =
            getAccounts();

        const account =
            accounts.find(
                a =>
                    Number(a.id) ===
                    accountId
            );

        if (!account) {

            return res.status(404).json({
                success: false,
                message:
                    "Không tìm thấy tài khoản."
            });
        }

        if (!code) {

            return res.status(400).json({
                success: false,
                message:
                    "Code không được để trống."
            });
        }

        const reward =
            REDEEM_CODES[code];

        if (!reward) {

            return res.status(400).json({
                success: false,
                message:
                    "Code không hợp lệ."
            });
        }

        if (
            !Array.isArray(
                account.redeemedCodes
            )
        ) {
            account.redeemedCodes = [];
        }

        if (
            account.redeemedCodes.includes(code)
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Bạn đã sử dụng code này."
            });
        }

        account.gold += reward.gold;
        account.gems += reward.gems;

        account.redeemedCodes.push(code);

        saveAccounts(accounts);

        return res.json({
            success: true,
            reward,
            account: publicAccount(account)
        });

    }
);

/*
============================================================
APPEAL
============================================================
*/

app.post(
    "/api/appeal",
    (req, res) => {

        const accountId =
            Number(req.body.accountId);

        const message =
            String(
                req.body.message || ""
            ).trim();

        const account =
            getAccountById(accountId);

        if (!account) {

            return res.status(404).json({
                success: false,
                message:
                    "Không tìm thấy tài khoản."
            });
        }

        if (
            message.length < 5
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Nội dung appeal quá ngắn."
            });
        }

        if (
            message.length > 3000
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Nội dung appeal quá dài."
            });
        }

        const appeals =
            getAppeals();

        const appeal = {

            id:
                nextAppealId(appeals),

            accountId:
                account.id,

            username:
                account.username,

            message,

            status:
                "pending",

            createdAt:
                new Date().toISOString()
        };

        appeals.push(appeal);

        saveAppeals(appeals);

        return res.json({
            success: true,
            message:
                "Appeal đã được gửi."
        });

    }
);

/*
============================================================
ADMIN ACCOUNTS
============================================================
*/

app.get(
    "/api/admin/accounts",
    (req, res) => {

        const admin =
            getAdmin(req);

        if (!admin) {

            return res.status(403).json({
                success: false,
                message:
                    "Không có quyền admin."
            });
        }

        const accounts =
            getAccounts().map(
                account => ({
                    id: account.id,
                    username:
                        account.username,
                    role:
                        account.role,
                    gold:
                        account.gold,
                    gems:
                        account.gems,
                    banned:
                        Boolean(account.banned)
                })
            );

        return res.json({
            success: true,
            accounts
        });

    }
);

/*
============================================================
ADMIN GIFT
============================================================
*/

app.post(
    "/api/admin/gift",
    (req, res) => {

        const admin =
            getAdmin(req);

        if (!admin) {

            return res.status(403).json({
                success: false,
                message:
                    "Không có quyền admin."
            });
        }

        const targetId =
            Number(req.body.accountId);

        const gold =
            Number(req.body.gold) || 0;

        const gems =
            Number(req.body.gems) || 0;

        if (
            gold < 0 ||
            gems < 0
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Gold/Gems không hợp lệ."
            });
        }

        const accounts =
            getAccounts();

        const target =
            accounts.find(
                a =>
                    Number(a.id) ===
                    targetId
            );

        if (!target) {

            return res.status(404).json({
                success: false,
                message:
                    "Không tìm thấy tài khoản."
            });
        }

        target.gold += gold;
        target.gems += gems;

        saveAccounts(accounts);

        return res.json({
            success: true,
            message:
                "Gift thành công."
        });

    }
);

/*
============================================================
ADMIN BAN
============================================================
*/

app.post(
    "/api/admin/ban",
    (req, res) => {

        const admin =
            getAdmin(req);

        if (!admin) {

            return res.status(403).json({
                success: false,
                message:
                    "Không có quyền admin."
            });
        }

        const targetId =
            Number(req.body.accountId);

        if (
            targetId === admin.id
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Không thể tự ban chính mình."
            });
        }

        const accounts =
            getAccounts();

        const target =
            accounts.find(
                a =>
                    Number(a.id) ===
                    targetId
            );

        if (!target) {

            return res.status(404).json({
                success: false,
                message:
                    "Không tìm thấy tài khoản."
            });
        }

        target.banned = true;

        saveAccounts(accounts);

        return res.json({
            success: true,
            message:
                "Đã ban tài khoản."
        });

    }
);

/*
============================================================
ADMIN UNBAN
============================================================
*/

app.post(
    "/api/admin/unban",
    (req, res) => {

        const admin =
            getAdmin(req);

        if (!admin) {

            return res.status(403).json({
                success: false,
                message:
                    "Không có quyền admin."
            });
        }

        const targetId =
            Number(req.body.accountId);

        const accounts =
            getAccounts();

        const target =
            accounts.find(
                a =>
                    Number(a.id) ===
                    targetId
            );

        if (!target) {

            return res.status(404).json({
                success: false,
                message:
                    "Không tìm thấy tài khoản."
            });
        }

        target.banned = false;

        saveAccounts(accounts);

        return res.json({
            success: true,
            message:
                "Đã unban tài khoản."
        });

    }
);

/*
============================================================
ADMIN GLOBAL MESSAGE
============================================================
*/

app.post(
    "/api/admin/global-message",
    (req, res) => {

        const admin =
            getAdmin(req);

        if (!admin) {

            return res.status(403).json({
                success: false,
                message:
                    "Không có quyền admin."
            });
        }

        const message =
            String(
                req.body.message || ""
            ).trim();

        if (
            message.length > 1000
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Thông báo quá dài."
            });
        }

        const server =
            getServerData();

        server.globalMessage =
            message;

        saveServerData(server);

        return res.json({
            success: true,
            message:
                "Đã cập nhật thông báo server."
        });

    }
);

/*
============================================================
ADMIN APPEALS
============================================================
*/

app.get(
    "/api/admin/appeals",
    (req, res) => {

        /*
        index hiện tại không gửi accountId
        cho endpoint này.

        Vì vậy bản mới cho phép admin endpoint
        qua header X-Admin-ID hoặc query accountId.
        Frontend bên dưới sẽ gửi accountId.
        */

        const adminId =
            Number(req.query.accountId);

        const admin =
            getAccountById(adminId);

        if (
            !admin ||
            admin.role !== "admin"
        ) {

            return res.status(403).json({
                success: false,
                message:
                    "Không có quyền admin."
            });
        }

        return res.json({
            success: true,
            appeals:
                getAppeals()
        });

    }
);

/*
============================================================
ADMIN RESPOND APPEAL
============================================================
*/

app.post(
    "/api/admin/appeal/respond",
    (req, res) => {

        const admin =
            getAdmin(req);

        if (!admin) {

            return res.status(403).json({
                success: false,
                message:
                    "Không có quyền admin."
            });
        }

        const appealId =
            Number(req.body.appealId);

        const action =
            String(
                req.body.action || ""
            ).toLowerCase();

        if (
            !["approve", "reject"]
            .includes(action)
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Action không hợp lệ."
            });
        }

        const appeals =
            getAppeals();

        const appeal =
            appeals.find(
                a =>
                    Number(a.id) ===
                    appealId
            );

        if (!appeal) {

            return res.status(404).json({
                success: false,
                message:
                    "Không tìm thấy appeal."
            });
        }

        if (
            appeal.status !==
            "pending"
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Appeal đã được xử lý."
            });
        }

        appeal.status =
            action === "approve"
                ? "approved"
                : "rejected";

        appeal.respondedAt =
            new Date().toISOString();

        appeal.respondedBy =
            admin.username;

        /*
        Nếu approve:
        tài khoản được unban.
        */

        if (
            action === "approve"
        ) {

            const accounts =
                getAccounts();

            const target =
                accounts.find(
                    a =>
                        Number(a.id) ===
                        Number(appeal.accountId)
                );

            if (target) {
                target.banned = false;
                saveAccounts(accounts);
            }
        }

        saveAppeals(appeals);

        return res.json({
            success: true,
            message:
                "Đã xử lý appeal."
        });

    }
);

/*
============================================================
SERVER DATA
============================================================
*/

app.get(
    "/api/server-info",
    (req, res) => {

        const server =
            getServerData();

        res.json({
            success: true,
            version:
                GAME_DATA.version,
            globalMessage:
                server.globalMessage
        });

    }
);

/*
============================================================
STATIC FRONTEND
============================================================
*/

app.use(
    express.static(ROOT_DIR, {
        extensions: ["html"]
    })
);

/*
============================================================
ROOT
============================================================
*/

app.get("/", (req, res) => {

    res.sendFile(
        path.join(
            ROOT_DIR,
            "index.html"
        )
    );

});

/*
============================================================
API 404
============================================================
*/

app.use("/api", (req, res) => {

    res.status(404).json({
        success: false,
        message:
            `API không tồn tại: ${req.method} ${req.originalUrl}`
    });

});

/*
============================================================
GENERAL 404
============================================================
*/

app.use((req, res) => {

    res.status(404).send(
        "404 - Page not found"
    );

});

/*
============================================================
ERROR HANDLER
============================================================
*/

app.use(
    (error, req, res, next) => {

        console.error(
            "SERVER ERROR:",
            error
        );

        if (
            res.headersSent
        ) {
            return next(error);
        }

        res.status(500).json({
            success: false,
            message:
                "Lỗi server nội bộ."
        });

    }
);

/*
============================================================
START
============================================================
*/

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log("");
        console.log(
            "=========================================="
        );
        console.log(
            " Stick War Ultimate Legends"
        );
        console.log(
            " Backend v2026.27.8"
        );
        console.log(
            "=========================================="
        );
        console.log(
            ` Server: http://localhost:${PORT}`
        );
        console.log(
            ` Admin: ${ADMIN_USERNAME}`
        );
        console.log(
            "=========================================="
        );
        console.log("");

    }
);
