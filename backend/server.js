const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();

const PORT = process.env.PORT || 3000;
const VERSION = "2026.27.8";

app.use(cors({
    origin: true,
    credentials: true
}));

app.use(express.json({ limit: "1mb" }));

/* =========================================================
   DATABASE
========================================================= */

const DATA_DIR = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "accounts.json");

if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

/* =========================================================
   PASSWORD
========================================================= */

function hashPassword(password) {
    return crypto
        .createHash("sha256")
        .update(String(password))
        .digest("hex");
}

/* =========================================================
   HELPERS
========================================================= */

function number(value, fallback = 0) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
}

function cleanUsername(value) {
    return String(value || "").trim();
}

function cleanCode(value) {
    return String(value || "").trim().toUpperCase();
}

function uniqueArray(value) {
    if (!Array.isArray(value)) return [];
    return [...new Set(value.map(Number).filter(Number.isFinite))];
}

/* =========================================================
   DEFAULT DATABASE
========================================================= */

function defaultDatabase() {

    return {
        nextAccountId: 2,

        accounts: [
            {
                id: 1,
                username: "admin",
                password: hashPassword("AdLegend2026"),
                role: "admin",

                gold: 999999999,
                gems: 999999999,

                completedCampaign: [],
                completedMissions: [],

                ownedUnits: [1, 2, 3, 4, 5],
                ownedRoyals: [1, 2, 3, 4, 5, 6],

                ownedArmors: [
                    1, 2, 3, 4, 5,
                    6, 7, 8, 9, 10
                ],

                equippedArmor: null,

                ownedSpells: [
                    1, 2, 3, 4, 5,
                    6, 7, 8, 9, 10,
                    11, 12, 13, 14, 15,
                    16, 17, 18, 19
                ],

                equippedSpells: [],

                redeemedCodes: [],

                banned: false,
                permanentBan: false
            }
        ],

        appeals: [],

        globalMessage: "",

        redeemCodes: {

            WELCOME2026: {
                gold: 10000,
                gems: 100,
                usedBy: []
            },

            SWUL2026: {
                gold: 50000,
                gems: 500,
                usedBy: []
            },

            LEGEND: {
                gold: 100000,
                gems: 1000,
                usedBy: []
            }

        }
    };
}

/* =========================================================
   NORMALIZE OLD DATABASE
========================================================= */

function normalizeAccount(account) {

    account.id = number(account.id);
    account.username = String(account.username || "");
    account.role = account.role || "player";

    account.gold = number(account.gold);
    account.gems = number(account.gems);

    account.completedCampaign =
        uniqueArray(account.completedCampaign);

    account.completedMissions =
        uniqueArray(account.completedMissions);

    account.ownedUnits =
        uniqueArray(account.ownedUnits);

    account.ownedRoyals =
        uniqueArray(account.ownedRoyals);

    account.ownedArmors =
        uniqueArray(account.ownedArmors);

    account.equippedArmor =
        account.equippedArmor == null
            ? null
            : number(account.equippedArmor);

    account.ownedSpells =
        uniqueArray(account.ownedSpells);

    account.equippedSpells =
        uniqueArray(account.equippedSpells);

    account.redeemedCodes =
        Array.isArray(account.redeemedCodes)
            ? account.redeemedCodes.map(String)
            : [];

    account.banned = !!account.banned;
    account.permanentBan = !!account.permanentBan;

    return account;
}

/* =========================================================
   LOAD DATABASE
========================================================= */

function loadDatabase() {

    if (!fs.existsSync(DATA_FILE)) {

        const db = defaultDatabase();

        saveDatabase(db);

        return db;
    }

    try {

        const db = JSON.parse(
            fs.readFileSync(
                DATA_FILE,
                "utf8"
            )
        );

        if (!db.accounts) {
            db.accounts = [];
        }

        if (!db.appeals) {
            db.appeals = [];
        }

        if (!db.redeemCodes) {
            db.redeemCodes = {};
        }

        if (!db.globalMessage) {
            db.globalMessage = "";
        }

        db.accounts =
            db.accounts.map(normalizeAccount);

        const maxId =
            db.accounts.reduce(
                (max, a) =>
                    Math.max(max, number(a.id)),
                1
            );

        db.nextAccountId =
            Math.max(
                number(db.nextAccountId),
                maxId + 1
            );

        return db;

    } catch (error) {

        console.error(
            "Database lỗi:",
            error
        );

        const db = defaultDatabase();

        saveDatabase(db);

        return db;
    }
}

/* =========================================================
   SAVE DATABASE
========================================================= */

function saveDatabase(database) {

    const tempFile =
        DATA_FILE + ".tmp";

    fs.writeFileSync(
        tempFile,
        JSON.stringify(database, null, 2),
        "utf8"
    );

    fs.renameSync(
        tempFile,
        DATA_FILE
    );
}

let db = loadDatabase();

/* =========================================================
   GAME DATA
========================================================= */

const GAME_DATA = {

    units: [

        {
            id: 1,
            name: "Swordwrath"
        },

        {
            id: 2,
            name: "Archidon"
        },

        {
            id: 3,
            name: "Spearton"
        },

        {
            id: 4,
            name: "Magikill"
        },

        {
            id: 5,
            name: "Giant"
        }

    ],

    royals: [

        {
            id: 1,
            name: "Xiphos"
        },

        {
            id: 2,
            name: "Kytchu"
        },

        {
            id: 3,
            name: "Atreyos"
        },

        {
            id: 4,
            name: "Icaron"
        },

        {
            id: 5,
            name: "Thera"
        },

        {
            id: 6,
            name: "Adicai"
        }

    ],

    armors: [

        {
            id: 1,
            name: "Iron Armor",
            displayName: "Iron Armor",
            description:
                "Giáp cơ bản dành cho chiến binh.",
            effects: [
                "+10% Defense"
            ],
            cost: 500
        },

        {
            id: 2,
            name: "Knight Armor",
            displayName: "Knight Armor",
            description:
                "Giáp hiệp sĩ chắc chắn.",
            effects: [
                "+20% Defense",
                "+5% HP"
            ],
            cost: 1500
        },

        {
            id: 3,
            name: "Dragon Armor",
            displayName: "Dragon Armor",
            description:
                "Giáp mang sức mạnh của rồng.",
            effects: [
                "+30% Defense",
                "+10% Damage"
            ],
            cost: 5000
        },

        {
            id: 4,
            name: "Shadow Armor",
            displayName: "Shadow Armor",
            description:
                "Giáp bóng tối.",
            effects: [
                "+20% Speed",
                "+15% Damage"
            ],
            cost: 7500
        },

        {
            id: 5,
            name: "Royal Armor",
            displayName: "Royal Armor",
            description:
                "Giáp hoàng gia.",
            effects: [
                "+35% Defense",
                "+15% HP"
            ],
            cost: 12000
        },

        {
            id: 6,
            name: "Titan Armor",
            displayName: "Titan Armor",
            description:
                "Bộ giáp khổng lồ.",
            effects: [
                "+50% Defense",
                "+25% HP"
            ],
            cost: 25000
        },

        {
            id: 7,
            name: "Inferno Armor",
            displayName: "Inferno Armor",
            description:
                "Giáp lửa địa ngục.",
            effects: [
                "+30% Damage",
                "Burn Effect"
            ],
            cost: 30000
        },

        {
            id: 8,
            name: "Void Armor",
            displayName: "Void Armor",
            description:
                "Giáp hư không.",
            effects: [
                "+40% Defense",
                "+20% Damage"
            ],
            cost: 40000
        },

        {
            id: 9,
            name: "Celestial Armor",
            displayName: "Celestial Armor",
            description:
                "Giáp thiên giới.",
            effects: [
                "+50% Defense",
                "+30% HP",
                "+15% Damage"
            ],
            cost: 75000
        },

        {
            id: 10,
            name: "Legendary Armor",
            displayName: "Legendary Armor",
            description:
                "Bộ giáp huyền thoại tối thượng.",
            effects: [
                "+75% Defense",
                "+50% HP",
                "+40% Damage"
            ],
            cost: 150000
        }

    ],

    spells: [

        { id: 1, name: "Lightning" },
        { id: 2, name: "Meteor" },
        { id: 3, name: "Fireball" },
        { id: 4, name: "Freeze" },
        { id: 5, name: "Heal" },
        { id: 6, name: "Rage" },
        { id: 7, name: "Shield" },
        { id: 8, name: "Tornado" },
        { id: 9, name: "Earthquake" },
        { id: 10, name: "Poison" },
        { id: 11, name: "Clone" },
        { id: 12, name: "Teleport" },
        { id: 13, name: "Arrow Rain" },
        { id: 14, name: "Darkness" },
        { id: 15, name: "Thunder Storm" },
        { id: 16, name: "Time Stop" },
        { id: 17, name: "Stone Skin" },
        { id: 18, name: "Speed" },
        { id: 19, name: "Summon" }

    ],

    campaign: [],

    missions: []

};

/* =========================================================
   CAMPAIGN DATA
========================================================= */

for (let i = 1; i <= 10; i++) {

    GAME_DATA.campaign.push({

        id: i,

        name:
            `Campaign ${i}`,

        reward:
            i * 1000

    });

}

/* =========================================================
   MISSION DATA
========================================================= */

for (let i = 1; i <= 10; i++) {

    GAME_DATA.missions.push({

        id: i,

        name:
            `Mission ${i}`,

        reward:
            i * 2000

    });

}

/* =========================================================
   PUBLIC ACCOUNT
========================================================= */

function publicAccount(account) {

    if (!account) return null;

    return {

        id: account.id,

        username: account.username,

        role: account.role,

        gold: number(account.gold),

        gems: number(account.gems),

        completedCampaign:
            uniqueArray(account.completedCampaign),

        completedMissions:
            uniqueArray(account.completedMissions),

        ownedUnits:
            uniqueArray(account.ownedUnits),

        ownedRoyals:
            uniqueArray(account.ownedRoyals),

        ownedArmors:
            uniqueArray(account.ownedArmors),

        equippedArmor:
            account.equippedArmor ?? null,

        ownedSpells:
            uniqueArray(account.ownedSpells),

        equippedSpells:
            uniqueArray(account.equippedSpells),

        redeemedCodes:
            Array.isArray(account.redeemedCodes)
                ? account.redeemedCodes
                : [],

        banned:
            !!account.banned

    };
}

/* =========================================================
   ACCOUNT FINDER
========================================================= */

function findAccount(id) {

    const accountId = number(id, NaN);

    if (!Number.isFinite(accountId)) {
        return null;
    }

    return db.accounts.find(
        account =>
            account.id === accountId
    );
}

/* =========================================================
   ROOT
========================================================= */

app.get("/", (req, res) => {

    res.json({

        game:
            "Stick War Ultimate Legends",

        version:
            VERSION,

        status:
            "online"

    });

});

/* =========================================================
   HEALTH
========================================================= */

app.get("/health", (req, res) => {

    res.json({

        status:
            "ok",

        game:
            "Stick War Ultimate Legends",

        version:
            VERSION,

        accounts:
            db.accounts.length

    });

});

/* =========================================================
   GAME DATA
========================================================= */

app.get("/api/game-data", (req, res) => {

    res.json(GAME_DATA);

});

/* =========================================================
   REGISTER
========================================================= */

app.post("/api/register", (req, res) => {

    const username =
        cleanUsername(req.body.username);

    const password =
        String(req.body.password || "");

    if (
        username.length < 3 ||
        username.length > 20
    ) {

        return res.status(400).json({

            message:
                "Username phải từ 3 đến 20 ký tự."

        });

    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {

        return res.status(400).json({

            message:
                "Username chỉ được dùng chữ, số và dấu _."

        });

    }

    if (password.length < 4) {

        return res.status(400).json({

            message:
                "Mật khẩu phải có ít nhất 4 ký tự."

        });

    }

    const exists =
        db.accounts.find(
            account =>
                account.username.toLowerCase() ===
                username.toLowerCase()
        );

    if (exists) {

        return res.status(409).json({

            message:
                "Tên tài khoản đã tồn tại."

        });

    }

    const account = {

        id:
            db.nextAccountId++,

        username,

        password:
            hashPassword(password),

        role:
            "player",

        gold:
            5000,

        gems:
            100,

        completedCampaign: [],

        completedMissions: [],

        ownedUnits: [1],

        ownedRoyals: [],

        ownedArmors: [],

        equippedArmor: null,

        ownedSpells: [],

        equippedSpells: [],

        redeemedCodes: [],

        banned: false,

        permanentBan: false

    };

    db.accounts.push(account);

    saveDatabase(db);

    res.status(201).json({

        message:
            "Tạo tài khoản thành công.",

        account:
            publicAccount(account)

    });

});

/* =========================================================
   LOGIN
========================================================= */

app.post("/api/login", (req, res) => {

    const username =
        cleanUsername(req.body.username);

    const password =
        String(req.body.password || "");

    const account =
        db.accounts.find(
            acc =>
                acc.username.toLowerCase() ===
                username.toLowerCase()
        );

    if (!account) {

        return res.status(401).json({

            message:
                "Sai tài khoản hoặc mật khẩu."

        });

    }

    if (
        account.password !==
        hashPassword(password)
    ) {

        return res.status(401).json({

            message:
                "Sai tài khoản hoặc mật khẩu."

        });

    }

    if (account.banned) {

        return res.status(403).json({

            message:
                "Tài khoản đang bị ban.",

            banned:
                true,

            accountId:
                account.id

        });

    }

    res.json({

        message:
            "Đăng nhập thành công.",

        account:
            publicAccount(account)

    });

});

/* =========================================================
   ACCOUNT
========================================================= */

app.get("/api/account/:id", (req, res) => {

    const account =
        findAccount(req.params.id);

    if (!account) {

        return res.status(404).json({

            message:
                "Không tìm thấy tài khoản."

        });

    }

    res.json({

        account:
            publicAccount(account)

    });

});

/* =========================================================
   CAMPAIGN COMPLETE
========================================================= */

app.post(
    "/api/campaign/complete",
    (req, res) => {

        const account =
            findAccount(req.body.accountId);

        const mapId =
            number(req.body.mapId, NaN);

        if (!account) {

            return res.status(404).json({

                message:
                    "Account không tồn tại."

            });

        }

        if (account.banned) {

            return res.status(403).json({

                message:
                    "Tài khoản đã bị ban."

            });

        }

        const map =
            GAME_DATA.campaign.find(
                m => m.id === mapId
            );

        if (!map) {

            return res.status(404).json({

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

                message:
                    "Campaign đã hoàn thành."

            });

        }

        if (mapId > 1) {

            const previous =
                account.completedCampaign.includes(
                    mapId - 1
                );

            if (!previous) {

                return res.status(400).json({

                    message:
                        "Campaign trước chưa hoàn thành."

                });

            }

        }

        account.completedCampaign.push(mapId);

        account.gold += map.reward;

        saveDatabase(db);

        res.json({

            account:
                publicAccount(account),

            reward:
                map.reward

        });

    }
);

/* =========================================================
   MISSION COMPLETE
========================================================= */

app.post(
    "/api/mission/complete",
    (req, res) => {

        const account =
            findAccount(req.body.accountId);

        const missionId =
            number(req.body.missionId, NaN);

        if (!account) {

            return res.status(404).json({

                message:
                    "Account không tồn tại."

            });

        }

        if (account.banned) {

            return res.status(403).json({

                message:
                    "Tài khoản đã bị ban."

            });

        }

        const mission =
            GAME_DATA.missions.find(
                m => m.id === missionId
            );

        if (!mission) {

            return res.status(404).json({

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

                message:
                    "Mission đã hoàn thành."

            });

        }

        if (missionId > 1) {

            if (
                !account.completedMissions.includes(
                    missionId - 1
                )
            ) {

                return res.status(400).json({

                    message:
                        "Mission trước chưa hoàn thành."

                });

            }

        }

        account.completedMissions.push(
            missionId
        );

        account.gold += mission.reward;

        saveDatabase(db);

        res.json({

            account:
                publicAccount(account),

            reward:
                mission.reward

        });

    }
);

/* =========================================================
   ARMOR UNLOCK
========================================================= */

app.post(
    "/api/armor/unlock",
    (req, res) => {

        const account =
            findAccount(req.body.accountId);

        const armorId =
            number(req.body.armorId, NaN);

        if (!account) {

            return res.status(404).json({

                message:
                    "Account không tồn tại."

            });

        }

        if (account.banned) {

            return res.status(403).json({

                message:
                    "Tài khoản đã bị ban."

            });

        }

        const armor =
            GAME_DATA.armors.find(
                a => a.id === armorId
            );

        if (!armor) {

            return res.status(404).json({

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

                message:
                    "Bạn đã sở hữu armor này."

            });

        }

        if (
            account.gold < armor.cost
        ) {

            return res.status(400).json({

                message:
                    "Không đủ Gold."

            });

        }

        account.gold -= armor.cost;

        account.ownedArmors.push(
            armorId
        );

        saveDatabase(db);

        res.json({

            account:
                publicAccount(account),

            armor

        });

    }
);

/* =========================================================
   ARMOR EQUIP
========================================================= */

app.post(
    "/api/armor/equip",
    (req, res) => {

        const account =
            findAccount(req.body.accountId);

        const armorId =
            number(req.body.armorId, NaN);

        if (!account) {

            return res.status(404).json({

                message:
                    "Account không tồn tại."

            });

        }

        if (account.banned) {

            return res.status(403).json({

                message:
                    "Tài khoản đã bị ban."

            });

        }

        const armor =
            GAME_DATA.armors.find(
                a => a.id === armorId
            );

        if (!armor) {

            return res.status(404).json({

                message:
                    "Armor không tồn tại."

            });

        }

        if (
            !account.ownedArmors.includes(
                armorId
            )
        ) {

            return res.status(400).json({

                message:
                    "Bạn chưa sở hữu armor."

            });

        }

        account.equippedArmor =
            armorId;

        saveDatabase(db);

        res.json({

            account:
                publicAccount(account),

            armor

        });

    }
);

/* =========================================================
   SPELL UNLOCK
========================================================= */

app.post(
    "/api/spell/unlock",
    (req, res) => {

        const account =
            findAccount(req.body.accountId);

        const spellId =
            number(req.body.spellId, NaN);

        if (!account) {

            return res.status(404).json({

                message:
                    "Account không tồn tại."

            });

        }

        if (account.banned) {

            return res.status(403).json({

                message:
                    "Tài khoản đã bị ban."

            });

        }

        const spell =
            GAME_DATA.spells.find(
                s => s.id === spellId
            );

        if (!spell) {

            return res.status(404).json({

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

                message:
                    "Bạn đã sở hữu Spell."

            });

        }

        const cost =
            spellId * 1000;

        if (account.gold < cost) {

            return res.status(400).json({

                message:
                    `Cần ${cost} Gold.`

            });

        }

        account.gold -= cost;

        account.ownedSpells.push(
            spellId
        );

        saveDatabase(db);

        res.json({

            account:
                publicAccount(account),

            spell,

            cost

        });

    }
);

/* =========================================================
   SPELL EQUIP
========================================================= */

app.post(
    "/api/spell/equip",
    (req, res) => {

        const account =
            findAccount(req.body.accountId);

        const spellId =
            number(req.body.spellId, NaN);

        if (!account) {

            return res.status(404).json({

                message:
                    "Account không tồn tại."

            });

        }

        if (account.banned) {

            return res.status(403).json({

                message:
                    "Tài khoản đã bị ban."

            });

        }

        const spell =
            GAME_DATA.spells.find(
                s => s.id === spellId
            );

        if (!spell) {

            return res.status(404).json({

                message:
                    "Spell không tồn tại."

            });

        }

        if (
            !account.ownedSpells.includes(
                spellId
            )
        ) {

            return res.status(400).json({

                message:
                    "Bạn chưa sở hữu Spell."

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

        saveDatabase(db);

        res.json({

            account:
                publicAccount(account),

            spell

        });

    }
);

/* =========================================================
   LEADERBOARD
========================================================= */

app.get(
    "/api/leaderboard",
    (req, res) => {

        const leaderboard =
            [...db.accounts]
                .filter(
                    account =>
                        !account.banned
                )
                .sort(
                    (a, b) =>
                        number(b.gold) -
                        number(a.gold)
                )
                .slice(0, 100)
                .map(
                    (account, index) => ({

                        rank:
                            index + 1,

                        username:
                            account.username,

                        gold:
                            number(account.gold),

                        gems:
                            number(account.gems)

                    })
                );

        res.json({

            leaderboard

        });

    }
);

/* =========================================================
   REDEEM CODE
========================================================= */

app.post(
    "/api/redeem-code",
    (req, res) => {

        const account =
            findAccount(req.body.accountId);

        const code =
            cleanCode(req.body.code);

        if (!account) {

            return res.status(404).json({

                message:
                    "Account không tồn tại."

            });

        }

        if (account.banned) {

            return res.status(403).json({

                message:
                    "Tài khoản đã bị ban."

            });

        }

        if (!code) {

            return res.status(400).json({

                message:
                    "Code không được để trống."

            });

        }

        const reward =
            db.redeemCodes[code];

        if (!reward) {

            return res.status(400).json({

                message:
                    "Code không hợp lệ."

            });

        }

        if (!Array.isArray(reward.usedBy)) {
            reward.usedBy = [];
        }

        if (
            reward.usedBy.includes(
                account.id
            )
        ) {

            return res.status(400).json({

                message:
                    "Bạn đã sử dụng code này."

            });

        }

        const gold =
            number(reward.gold);

        const gems =
            number(reward.gems);

        account.gold += gold;
        account.gems += gems;

        reward.usedBy.push(
            account.id
        );

        if (
            !account.redeemedCodes.includes(code)
        ) {

            account.redeemedCodes.push(code);

        }

        saveDatabase(db);

        res.json({

            account:
                publicAccount(account),

            reward: {

                gold,

                gems

            }

        });

    }
);

/* =========================================================
   APPEAL
========================================================= */

app.post(
    "/api/appeal",
    (req, res) => {

        const account =
            findAccount(req.body.accountId);

        const message =
            String(
                req.body.message || ""
            ).trim();

        if (!account) {

            return res.status(404).json({

                message:
                    "Account không tồn tại."

            });

        }

        if (!message) {

            return res.status(400).json({

                message:
                    "Appeal không được để trống."

            });

        }

        if (message.length > 3000) {

            return res.status(400).json({

                message:
                    "Appeal tối đa 3000 ký tự."

            });

        }

        const pending =
            db.appeals.find(
                appeal =>
                    appeal.accountId === account.id &&
                    appeal.status === "pending"
            );

        if (pending) {

            return res.status(400).json({

                message:
                    "Bạn đã có một appeal đang chờ xử lý."

            });

        }

        const appeal = {

            id:
                Date.now(),

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

        db.appeals.push(appeal);

        saveDatabase(db);

        res.json({

            message:
                "Appeal đã được gửi.",

            appeal

        });

    }
);

/* =========================================================
   ADMIN HELPER
========================================================= */

function isAdmin(accountId) {

    const account =
        findAccount(accountId);

    return !!(
        account &&
        account.role === "admin" &&
        !account.banned
    );
}

/*
   LƯU Ý:

   index.html hiện tại không gửi admin accountId
   trong các API admin.

   Vì vậy các route admin vẫn giữ tương thích
   với index hiện tại.

   Khi nâng cấp frontend sang authentication token,
   nên khóa toàn bộ admin API bằng token.
*/

/* =========================================================
   ADMIN ACCOUNTS
========================================================= */

app.get(
    "/api/admin/accounts",
    (req, res) => {

        const accountId =
            req.query.accountId ||
            req.headers["x-account-id"];

        /*
           index.html hiện tại gọi:
           GET /api/admin/accounts

           không gửi accountId.

           Cho phép tương thích với frontend hiện tại.
        */

        if (
            accountId &&
            !isAdmin(accountId)
        ) {

            return res.status(403).json({

                message:
                    "Không có quyền Admin."

            });

        }

        res.json({

            accounts:
                db.accounts.map(
                    account => ({

                        id:
                            account.id,

                        username:
                            account.username,

                        role:
                            account.role,

                        gold:
                            number(account.gold),

                        gems:
                            number(account.gems),

                        banned:
                            !!account.banned

                    })
                )

        });

    }
);

/* =========================================================
   ADMIN BAN
========================================================= */

app.post(
    "/api/admin/ban",
    (req, res) => {

        const id =
            number(req.body.accountId, NaN);

        const target =
            findAccount(id);

        if (!target) {

            return res.status(404).json({

                message:
                    "Account không tồn tại."

            });

        }

        if (target.role === "admin") {

            return res.status(403).json({

                message:
                    "Không thể ban Admin."

            });

        }

        target.banned = true;

        target.permanentBan =
            !!req.body.permanent;

        saveDatabase(db);

        res.json({

            message:
                target.permanentBan
                    ? "Account đã bị permanent ban."
                    : "Account đã bị ban.",

            account:
                publicAccount(target)

        });

    }
);

/* =========================================================
   ADMIN UNBAN
========================================================= */

app.post(
    "/api/admin/unban",
    (req, res) => {

        const id =
            number(req.body.accountId, NaN);

        const target =
            findAccount(id);

        if (!target) {

            return res.status(404).json({

                message:
                    "Account không tồn tại."

            });

        }

        target.banned = false;
        target.permanentBan = false;

        saveDatabase(db);

        res.json({

            message:
                "Account đã được unban.",

            account:
                publicAccount(target)

        });

    }
);

/* =========================================================
   ADMIN APPEALS
========================================================= */

app.get(
    "/api/admin/appeals",
    (req, res) => {

        res.json({

            appeals:
                db.appeals

        });

    }
);

/* =========================================================
   ADMIN APPEAL RESPONSE
========================================================= */

app.post(
    "/api/admin/appeal/respond",
    (req, res) => {

        const accountId =
            number(req.body.accountId, NaN);

        const appealId =
            number(req.body.appealId, NaN);

        const action =
            String(
                req.body.action || ""
            ).toLowerCase();

        const account =
            findAccount(accountId);

        const appeal =
            db.appeals.find(
                a =>
                    a.id === appealId
            );

        if (!account || !appeal) {

            return res.status(404).json({

                message:
                    "Không tìm thấy appeal."

            });

        }

        if (
            action !== "approve" &&
            action !== "reject"
        ) {

            return res.status(400).json({

                message:
                    "Action không hợp lệ."

            });

        }

        appeal.status =
            action === "approve"
                ? "approved"
                : "rejected";

        appeal.respondedAt =
            new Date().toISOString();

        if (action === "approve") {

            account.banned = false;
            account.permanentBan = false;

        }

        saveDatabase(db);

        res.json({

            message:
                "Đã xử lý appeal.",

            appeal,

            account:
                publicAccount(account)

        });

    }
);

/* =========================================================
   ADMIN GIFT
========================================================= */

app.post(
    "/api/admin/gift",
    (req, res) => {

        const accountId =
            number(req.body.accountId, NaN);

        const target =
            findAccount(accountId);

        if (!target) {

            return res.status(404).json({

                message:
                    "Không tìm thấy player."

            });

        }

        const gold =
            Math.max(
                0,
                number(req.body.gold)
            );

        const gems =
            Math.max(
                0,
                number(req.body.gems)
            );

        const skin =
            String(
                req.body.skin || ""
            ).trim();

        target.gold += gold;
        target.gems += gems;

        /*
           Frontend hiện tại chỉ gửi skin dạng string.
           Lưu skin vào ownedSkins để không mất dữ liệu.
        */

        if (!Array.isArray(target.ownedSkins)) {
            target.ownedSkins = [];
        }

        if (
            skin &&
            !target.ownedSkins.includes(skin)
        ) {

            target.ownedSkins.push(skin);

        }

        saveDatabase(db);

        res.json({

            message:
                "Gift thành công.",

            account:
                publicAccount(target)

        });

    }
);

/* =========================================================
   GLOBAL MESSAGE
========================================================= */

app.post(
    "/api/admin/global-message",
    (req, res) => {

        const message =
            String(
                req.body.message || ""
            ).trim();

        if (message.length > 1000) {

            return res.status(400).json({

                message:
                    "Global Message tối đa 1000 ký tự."

            });

        }

        db.globalMessage =
            message;

        saveDatabase(db);

        res.json({

            message:
                "Global Message đã cập nhật.",

            globalMessage:
                db.globalMessage

        });

    }
);

/* =========================================================
   GLOBAL MESSAGE GET
========================================================= */

app.get(
    "/api/global-message",
    (req, res) => {

        res.json({

            globalMessage:
                db.globalMessage || ""

        });

    }
);

/* =========================================================
   ADMIN STATUS
========================================================= */

app.get(
    "/api/admin/status",
    (req, res) => {

        const accountId =
            req.query.accountId ||
            req.headers["x-account-id"];

        res.json({

            isAdmin:
                isAdmin(accountId)

        });

    }
);

/* =========================================================
   404
========================================================= */

app.use(
    (req, res) => {

        res.status(404).json({

            message:
                "API route không tồn tại.",

            path:
                req.path

        });

    }
);

/* =========================================================
   ERROR HANDLER
========================================================= */

app.use(
    (error, req, res, next) => {

        console.error(
            "SERVER ERROR:",
            error
        );

        res.status(500).json({

            message:
                "Server Error."

        });

    }
);

/* =========================================================
   START SERVER
========================================================= */

app.listen(
    PORT,
    () => {

        console.log(
            "========================================"
        );

        console.log(
            "STICK WAR ULTIMATE LEGENDS"
        );

        console.log(
            `Version: ${VERSION}`
        );

        console.log(
            `Server running on port ${PORT}`
        );

        console.log(
            "Admin ID: admin"
        );

        console.log(
            "Admin Password: AdLegend2026"
        );

        console.log(
            "========================================"
        );

    }
);
