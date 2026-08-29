const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

/* =========================================================
   CONFIG
========================================================= */

const VERSION = "2026.27.8";

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
        .update(password)
        .digest("hex");
}

/* =========================================================
   DATABASE
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

                ownedArmors: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],

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
            "WELCOME2026": {
                gold: 10000,
                gems: 100,
                usedBy: []
            },

            "SWUL2026": {
                gold: 50000,
                gems: 500,
                usedBy: []
            },

            "LEGEND": {
                gold: 100000,
                gems: 1000,
                usedBy: []
            }
        }
    };
}


function loadDatabase() {

    if (!fs.existsSync(DATA_FILE)) {

        const db = defaultDatabase();

        saveDatabase(db);

        return db;
    }

    try {

        const db =
            JSON.parse(
                fs.readFileSync(
                    DATA_FILE,
                    "utf8"
                )
            );

        return db;

    } catch (error) {

        console.error(
            "Database lỗi, tạo database mới."
        );

        const db = defaultDatabase();

        saveDatabase(db);

        return db;
    }
}


function saveDatabase(db) {

    fs.writeFileSync(
        DATA_FILE,
        JSON.stringify(db, null, 2),
        "utf8"
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
            description: "Giáp cơ bản dành cho chiến binh.",
            effects: [
                "+10% Defense"
            ],
            cost: 500
        },

        {
            id: 2,
            name: "Knight Armor",
            displayName: "Knight Armor",
            description: "Giáp hiệp sĩ chắc chắn.",
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
            description: "Giáp mang sức mạnh của rồng.",
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
            description: "Giáp bóng tối.",
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
            description: "Giáp hoàng gia.",
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
            description: "Bộ giáp khổng lồ.",
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
            description: "Giáp lửa địa ngục.",
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
            description: "Giáp hư không.",
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
            description: "Giáp thiên giới.",
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
            description: "Bộ giáp huyền thoại tối thượng.",
            effects: [
                "+75% Defense",
                "+50% HP",
                "+40% Damage"
            ],
            cost: 150000
        }

    ],


    spells: [

        {
            id: 1,
            name: "Lightning"
        },

        {
            id: 2,
            name: "Meteor"
        },

        {
            id: 3,
            name: "Fireball"
        },

        {
            id: 4,
            name: "Freeze"
        },

        {
            id: 5,
            name: "Heal"
        },

        {
            id: 6,
            name: "Rage"
        },

        {
            id: 7,
            name: "Shield"
        },

        {
            id: 8,
            name: "Tornado"
        },

        {
            id: 9,
            name: "Earthquake"
        },

        {
            id: 10,
            name: "Poison"
        },

        {
            id: 11,
            name: "Clone"
        },

        {
            id: 12,
            name: "Teleport"
        },

        {
            id: 13,
            name: "Arrow Rain"
        },

        {
            id: 14,
            name: "Darkness"
        },

        {
            id: 15,
            name: "Thunder Storm"
        },

        {
            id: 16,
            name: "Time Stop"
        },

        {
            id: 17,
            name: "Stone Skin"
        },

        {
            id: 18,
            name: "Speed"
        },

        {
            id: 19,
            name: "Summon"
        }

    ]

};


/* =========================================================
   CAMPAIGN
========================================================= */

GAME_DATA.campaign = [];

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
   MISSIONS
========================================================= */

GAME_DATA.missions = [];

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

        gold: account.gold,

        gems: account.gems,

        completedCampaign:
            account.completedCampaign || [],

        completedMissions:
            account.completedMissions || [],

        ownedUnits:
            account.ownedUnits || [],

        ownedRoyals:
            account.ownedRoyals || [],

        ownedArmors:
            account.ownedArmors || [],

        equippedArmor:
            account.equippedArmor ?? null,

        ownedSpells:
            account.ownedSpells || [],

        equippedSpells:
            account.equippedSpells || [],

        redeemedCodes:
            account.redeemedCodes || [],

        banned:
            !!account.banned

    };

}


/* =========================================================
   ROOT
========================================================= */

app.get("/", (req, res) => {

    res.json({

        game: "Stick War Ultimate Legends",

        version: VERSION,

        status: "online"

    });

});


/* =========================================================
   GAME DATA
========================================================= */

app.get(
    "/api/game-data",
    (req, res) => {

        res.json(GAME_DATA);

    }
);


/* =========================================================
   REGISTER
========================================================= */

app.post(
    "/api/register",
    (req, res) => {

        const username =
            String(
                req.body.username || ""
            ).trim();

        const password =
            String(
                req.body.password || ""
            );

        if (
            username.length < 3 ||
            username.length > 20
        ) {

            return res.status(400).json({

                message:
                    "Username phải từ 3 đến 20 ký tự."

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

            id: db.nextAccountId++,

            username,

            password:
                hashPassword(password),

            role: "player",

            gold: 5000,

            gems: 100,

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

        res.json({

            message:
                "Tạo tài khoản thành công.",

            account:
                publicAccount(account)

        });

    }
);


/* =========================================================
   LOGIN
========================================================= */

app.post(
    "/api/login",
    (req, res) => {

        const username =
            String(
                req.body.username || ""
            ).trim();

        const password =
            String(
                req.body.password || ""
            );

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

                banned: true,

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

    }
);


/* =========================================================
   ACCOUNT
========================================================= */

app.get(
    "/api/account/:id",
    (req, res) => {

        const id =
            Number(req.params.id);

        const account =
            db.accounts.find(
                acc => acc.id === id
            );

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

    }
);


/* =========================================================
   CAMPAIGN COMPLETE
========================================================= */

app.post(
    "/api/campaign/complete",
    (req, res) => {

        const account =
            db.accounts.find(
                acc =>
                    acc.id ===
                    Number(req.body.accountId)
            );

        const mapId =
            Number(req.body.mapId);

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

            if (
                !account.completedCampaign.includes(
                    mapId - 1
                )
            ) {

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
            db.accounts.find(
                acc =>
                    acc.id ===
                    Number(req.body.accountId)
            );

        const missionId =
            Number(req.body.missionId);

        if (!account) {

            return res.status(404).json({

                message:
                    "Account không tồn tại."

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
            db.accounts.find(
                acc =>
                    acc.id ===
                    Number(req.body.accountId)
            );

        const armorId =
            Number(req.body.armorId);

        if (!account) {

            return res.status(404).json({

                message:
                    "Account không tồn tại."

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

        if (account.gold < armor.cost) {

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
            db.accounts.find(
                acc =>
                    acc.id ===
                    Number(req.body.accountId)
            );

        const armorId =
            Number(req.body.armorId);

        if (!account) {

            return res.status(404).json({

                message:
                    "Account không tồn tại."

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

        const armor =
            GAME_DATA.armors.find(
                a => a.id === armorId
            );

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
            db.accounts.find(
                acc =>
                    acc.id ===
                    Number(req.body.accountId)
            );

        const spellId =
            Number(req.body.spellId);

        if (!account) {

            return res.status(404).json({

                message:
                    "Account không tồn tại."

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
            db.accounts.find(
                acc =>
                    acc.id ===
                    Number(req.body.accountId)
            );

        const spellId =
            Number(req.body.spellId);

        if (!account) {

            return res.status(404).json({

                message:
                    "Account không tồn tại."

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
                publicAccount(account)

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
            db.accounts
                .filter(
                    account =>
                        !account.banned
                )
                .sort(
                    (a, b) =>
                        b.gold - a.gold
                )
                .slice(0, 100)
                .map(
                    (account, index) => ({

                        rank:
                            index + 1,

                        username:
                            account.username,

                        gold:
                            account.gold,

                        gems:
                            account.gems

                    })
                );

        res.json({

            leaderboard

        });

    }
);


/* =========================================================
   REDEEM
========================================================= */

app.post(
    "/api/redeem-code",
    (req, res) => {

        const account =
            db.accounts.find(
                acc =>
                    acc.id ===
                    Number(req.body.accountId)
            );

        const code =
            String(
                req.body.code || ""
            ).trim().toUpperCase();

        if (!account) {

            return res.status(404).json({

                message:
                    "Account không tồn tại."

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

        account.gold +=
            Number(reward.gold || 0);

        account.gems +=
            Number(reward.gems || 0);

        reward.usedBy.push(
            account.id
        );

        account.redeemedCodes.push(
            code
        );

        saveDatabase(db);

        res.json({

            account:
                publicAccount(account),

            reward: {

                gold:
                    reward.gold,

                gems:
                    reward.gems

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
            db.accounts.find(
                acc =>
                    acc.id ===
                    Number(req.body.accountId)
            );

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

        db.appeals.push(
            appeal
        );

        saveDatabase(db);

        res.json({

            message:
                "Appeal đã được gửi.",

            appeal

        });

    }
);


/* =========================================================
   ADMIN CHECK
========================================================= */

function requireAdmin(req, res, next) {

    const accountId =
        Number(
            req.body.accountId ||
            req.query.accountId ||
            req.headers["x-account-id"]
        );

    const account =
        db.accounts.find(
            acc =>
                acc.id === accountId
        );

    if (
        !account ||
        account.role !== "admin"
    ) {

        return res.status(403).json({

            message:
                "Không có quyền Admin."

        });

    }

    req.admin = account;

    next();

}


/*
   Frontend hiện tại không gửi admin accountId
   trong các request admin.

   Vì vậy middleware bên dưới cho phép kiểm tra
   bằng query/header nếu sau này frontend thêm vào.
*/


/* =========================================================
   ADMIN ACCOUNTS
========================================================= */

app.get(
    "/api/admin/accounts",
    (req, res) => {

        const accountId =
            Number(
                req.query.accountId ||
                req.headers["x-account-id"]
            );

        const admin =
            db.accounts.find(
                a =>
                    a.id === accountId &&
                    a.role === "admin"
            );

        /*
           Frontend hiện tại gọi endpoint này
           không truyền accountId.

           Cho bản local/demo, cho phép đọc.
        */

        if (
            accountId &&
            !admin
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
                            account.gold,

                        gems:
                            account.gems,

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
            Number(req.body.accountId);

        const target =
            db.accounts.find(
                a => a.id === id
            );

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
                "Account đã bị ban."

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
            Number(req.body.accountId);

        const target =
            db.accounts.find(
                a => a.id === id
            );

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
                "Account đã được unban."

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
            Number(req.body.accountId);

        const appealId =
            Number(req.body.appealId);

        const action =
            req.body.action;

        const account =
            db.accounts.find(
                a =>
                    a.id === accountId
            );

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

        if (action === "approve") {

            account.banned = false;

            account.permanentBan =
                false;

        }

        saveDatabase(db);

        res.json({

            message:
                "Đã xử lý appeal.",

            appeal

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
            Number(req.body.accountId);

        const target =
            db.accounts.find(
                a =>
                    a.id === accountId
            );

        if (!target) {

            return res.status(404).json({

                message:
                    "Không tìm thấy player."

            });

        }

        const gold =
            Math.max(
                0,
                Number(req.body.gold) || 0
            );

        const gems =
            Math.max(
                0,
                Number(req.body.gems) || 0
            );

        target.gold += gold;

        target.gems += gems;

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
   HEALTH
========================================================= */

app.get(
    "/health",
    (req, res) => {

        res.json({

            status: "ok",

            game:
                "Stick War Ultimate Legends",

            version:
                VERSION,

            accounts:
                db.accounts.length

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

        console.error(error);

        res.status(500).json({

            message:
                "Server Error."

        });

    }
);


/* =========================================================
   START
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
            "Admin: admin"
        );

        console.log(
            "========================================"
        );

    }
);
