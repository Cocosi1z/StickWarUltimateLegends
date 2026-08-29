/*
============================================================
 STICK WAR ULTIMATE LEGENDS
 Backend Server
 Version: 2026.27.8
============================================================

Cài:
    npm init -y
    npm install express cors bcryptjs

Chạy:
    node server.js

Mở:
    http://localhost:3000

Admin mặc định:
    ID: admin
    PW: AdLegend2026

KHUYẾN NGHỊ:
    Đổi ADMIN_PASSWORD trong biến môi trường khi deploy thật.
============================================================
*/

"use strict";

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3000;

const DATA_DIR = path.join(__dirname, "data");
const DB_FILE = path.join(DATA_DIR, "swul_accounts.json");

const ADMIN_USERNAME =
    process.env.ADMIN_USERNAME || "admin";

const ADMIN_PASSWORD =
    process.env.ADMIN_PASSWORD || "AdLegend2026";

/* =========================================================
   MIDDLEWARE
========================================================= */

app.disable("x-powered-by");

app.use(
    cors({
        origin: true,
        credentials: false
    })
);

app.use(
    express.json({
        limit: "1mb"
    })
);

app.use(
    express.urlencoded({
        extended: true
    })
);

/*
Cho phép index.html nằm cùng thư mục với server.js
*/
app.use(express.static(__dirname));

/* =========================================================
   DATABASE
========================================================= */

if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, {
        recursive: true
    });
}

function saveDB() {
    const tempFile = DB_FILE + ".tmp";

    fs.writeFileSync(
        tempFile,
        JSON.stringify(database, null, 2),
        "utf8"
    );

    fs.renameSync(
        tempFile,
        DB_FILE
    );
}

function loadDB() {
    if (!fs.existsSync(DB_FILE)) {
        return {
            nextAccountId: 1,
            accounts: [],
            appeals: [],
            globalMessage: "",
            redeemCodes: {}
        };
    }

    try {
        const raw =
            fs.readFileSync(
                DB_FILE,
                "utf8"
            );

        const data =
            JSON.parse(raw);

        data.nextAccountId =
            Number(data.nextAccountId) || 1;

        data.accounts =
            Array.isArray(data.accounts)
                ? data.accounts
                : [];

        data.appeals =
            Array.isArray(data.appeals)
                ? data.appeals
                : [];

        data.globalMessage =
            typeof data.globalMessage === "string"
                ? data.globalMessage
                : "";

        data.redeemCodes =
            data.redeemCodes &&
            typeof data.redeemCodes === "object"
                ? data.redeemCodes
                : {};

        return data;

    } catch (error) {

        console.error(
            "Không đọc được database:",
            error
        );

        return {
            nextAccountId: 1,
            accounts: [],
            appeals: [],
            globalMessage: "",
            redeemCodes: {}
        };
    }
}

let database = loadDB();

/* =========================================================
 GAME DATA
========================================================= */

const GAME_DATA = {

    version: "2026.27.8",

    campaign: [
        {
            id: 1,
            name: "The Beginning",
            reward: 500
        },
        {
            id: 2,
            name: "Rise of Order",
            reward: 750
        },
        {
            id: 3,
            name: "Battlefield",
            reward: 1000
        },
        {
            id: 4,
            name: "The Empire",
            reward: 1500
        },
        {
            id: 5,
            name: "Dark Legion",
            reward: 2000
        },
        {
            id: 6,
            name: "Final War",
            reward: 3000
        }
    ],

    missions: [
        {
            id: 1,
            name: "First Blood",
            reward: 300
        },
        {
            id: 2,
            name: "Miner",
            reward: 450
        },
        {
            id: 3,
            name: "Army Builder",
            reward: 600
        },
        {
            id: 4,
            name: "Destroy the Enemy",
            reward: 800
        },
        {
            id: 5,
            name: "Royal Battle",
            reward: 1200
        },
        {
            id: 6,
            name: "Legendary Warrior",
            reward: 1800
        }
    ],

    armors: [
        {
            id: 1,
            displayName: "Iron Armor",
            description: "Giáp cơ bản cho chiến binh.",
            cost: 1000,
            effects: [
                "+10% Defense"
            ]
        },
        {
            id: 2,
            displayName: "Knight Armor",
            description: "Giáp hiệp sĩ chắc chắn.",
            cost: 3000,
            effects: [
                "+20% Defense",
                "+5% HP"
            ]
        },
        {
            id: 3,
            displayName: "Dragon Armor",
            description: "Giáp rồng huyền thoại.",
            cost: 7500,
            effects: [
                "+35% Defense",
                "+10% HP",
                "+5% Damage"
            ]
        },
        {
            id: 4,
            displayName: "Shadow Armor",
            description: "Giáp bóng tối.",
            cost: 12000,
            effects: [
                "+25% Defense",
                "+15% Speed",
                "+10% Damage"
            ]
        },
        {
            id: 5,
            displayName: "Royal Armor",
            description: "Trang bị dành cho hoàng gia.",
            cost: 20000,
            effects: [
                "+45% Defense",
                "+20% HP",
                "+15% Damage"
            ]
        },
        {
            id: 6,
            displayName: "Titan Armor",
            description: "Bộ giáp của Titan.",
            cost: 50000,
            effects: [
                "+70% Defense",
                "+35% HP",
                "+25% Damage"
            ]
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
    ]

};

/* =========================================================
 ACCOUNT HELPERS
========================================================= */

function normalizeUsername(username) {
    return String(username || "")
        .trim()
        .toLowerCase();
}

function publicAccount(account) {

    if (!account) {
        return null;
    }

    /*
    TUYỆT ĐỐI không trả passwordHash về frontend.
    */

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
            account.equippedArmor || null,

        ownedSpells:
            Array.isArray(account.ownedSpells)
                ? account.ownedSpells
                : [],

        equippedSpells:
            Array.isArray(account.equippedSpells)
                ? account.equippedSpells
                : [],

        banned:
            Boolean(account.banned)
    };
}

function findAccountById(id) {

    return database.accounts.find(
        account =>
            Number(account.id) === Number(id)
    );
}

function findAccountByUsername(username) {

    const normalized =
        normalizeUsername(username);

    return database.accounts.find(
        account =>
            normalizeUsername(
                account.username
            ) === normalized
    );
}

function requireAccount(id) {

    const account =
        findAccountById(id);

    if (!account) {
        const error =
            new Error(
                "Không tìm thấy tài khoản."
            );

        error.status = 404;

        throw error;
    }

    if (account.banned) {

        const error =
            new Error(
                "Tài khoản của bạn đã bị ban."
            );

        error.status = 403;

        throw error;
    }

    return account;
}

function requireAdmin(id) {

    const account =
        findAccountById(id);

    if (!account) {

        const error =
            new Error(
                "Không tìm thấy tài khoản."
            );

        error.status = 401;

        throw error;
    }

    if (account.banned) {

        const error =
            new Error(
                "Tài khoản đã bị ban."
            );

        error.status = 403;

        throw error;
    }

    if (account.role !== "admin") {

        const error =
            new Error(
                "Bạn không có quyền Admin."
            );

        error.status = 403;

        throw error;
    }

    return account;
}

/* =========================================================
 ACCOUNT FACTORY
========================================================= */

function createAccount(
    username,
    passwordHash,
    role = "player"
) {

    const account = {

        id: database.nextAccountId++,

        username,

        passwordHash,

        role,

        gold:
            role === "admin"
                ? 999999999
                : 1000,

        gems:
            role === "admin"
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

        createdAt:
            new Date().toISOString()
    };

    database.accounts.push(account);

    return account;
}

/* =========================================================
 DEFAULT ADMIN
========================================================= */

async function ensureAdmin() {

    let admin =
        findAccountByUsername(
            ADMIN_USERNAME
        );

    if (!admin) {

        const passwordHash =
            await bcrypt.hash(
                ADMIN_PASSWORD,
                12
            );

        admin =
            createAccount(
                ADMIN_USERNAME,
                passwordHash,
                "admin"
            );

        saveDB();

        console.log(
            "===================================="
        );

        console.log(
            "ADMIN ĐÃ ĐƯỢC TẠO"
        );

        console.log(
            "ID:",
            ADMIN_USERNAME
        );

        console.log(
            "Password:",
            ADMIN_PASSWORD
        );

        console.log(
            "===================================="
        );

    } else if (admin.role !== "admin") {

        admin.role = "admin";

        saveDB();
    }
}

/* =========================================================
 VALIDATION
========================================================= */

function validateUsername(username) {

    if (!username) {
        return "Vui lòng nhập tên tài khoản.";
    }

    if (username.length < 3) {
        return "Tên tài khoản phải có ít nhất 3 ký tự.";
    }

    if (username.length > 20) {
        return "Tên tài khoản tối đa 20 ký tự.";
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return "Tên tài khoản chỉ được chứa chữ, số và _.";
    }

    return null;
}

function validatePassword(password) {

    if (!password) {
        return "Vui lòng nhập mật khẩu.";
    }

    if (password.length < 6) {
        return "Mật khẩu phải có ít nhất 6 ký tự.";
    }

    if (password.length > 128) {
        return "Mật khẩu quá dài.";
    }

    return null;
}

/* =========================================================
 HEALTH
========================================================= */

app.get(
    "/api/health",
    (req, res) => {

        res.json({
            status: "online",
            game: "Stick War Ultimate Legends",
            version: GAME_DATA.version,
            serverTime:
                new Date().toISOString()
        });

    }
);

/* =========================================================
 GAME DATA
========================================================= */

app.get(
    "/api/game-data",
    (req, res) => {

        res.json({
            version: GAME_DATA.version,
            campaign: GAME_DATA.campaign,
            missions: GAME_DATA.missions,
            armors: GAME_DATA.armors,
            spells: GAME_DATA.spells
        });

    }
);

/* =========================================================
 REGISTER
========================================================= */

app.post(
    "/api/register",
    async (req, res) => {

        try {

            const username =
                String(
                    req.body.username || ""
                ).trim();

            const password =
                String(
                    req.body.password || ""
                );

            const usernameError =
                validateUsername(
                    username
                );

            if (usernameError) {

                return res.status(400).json({
                    message: usernameError
                });

            }

            const passwordError =
                validatePassword(
                    password
                );

            if (passwordError) {

                return res.status(400).json({
                    message: passwordError
                });

            }

            if (
                findAccountByUsername(
                    username
                )
            ) {

                return res.status(409).json({
                    message:
                        "Tên tài khoản đã tồn tại."
                });

            }

            const passwordHash =
                await bcrypt.hash(
                    password,
                    12
                );

            const account =
                createAccount(
                    username,
                    passwordHash
                );

            saveDB();

            return res.status(201).json({
                message:
                    "Tạo tài khoản thành công.",
                account:
                    publicAccount(account)
            });

        } catch (error) {

            console.error(
                "REGISTER ERROR:",
                error
            );

            return res.status(500).json({
                message:
                    "Lỗi server khi tạo tài khoản."
            });
        }

    }
);

/* =========================================================
 LOGIN
========================================================= */

app.post(
    "/api/login",
    async (req, res) => {

        try {

            const username =
                String(
                    req.body.username || ""
                ).trim();

            const password =
                String(
                    req.body.password || ""
                );

            const account =
                findAccountByUsername(
                    username
                );

            if (!account) {

                return res.status(401).json({
                    message:
                        "Sai tên tài khoản hoặc mật khẩu."
                });

            }

            const valid =
                await bcrypt.compare(
                    password,
                    account.passwordHash
                );

            if (!valid) {

                return res.status(401).json({
                    message:
                        "Sai tên tài khoản hoặc mật khẩu."
                });

            }

            if (account.banned) {

                return res.status(403).json({
                    message:
                        "Tài khoản của bạn đã bị ban."
                });

            }

            return res.json({
                message:
                    "Đăng nhập thành công.",
                account:
                    publicAccount(account)
            });

        } catch (error) {

            console.error(
                "LOGIN ERROR:",
                error
            );

            return res.status(500).json({
                message:
                    "Lỗi server khi đăng nhập."
            });
        }

    }
);

/* =========================================================
 ACCOUNT
========================================================= */

app.get(
    "/api/account/:id",
    (req, res) => {

        try {

            const account =
                requireAccount(
                    req.params.id
                );

            return res.json({
                account:
                    publicAccount(account)
            });

        } catch (error) {

            return res.status(
                error.status || 500
            ).json({
                message:
                    error.message
            });
        }

    }
);

/* =========================================================
 CAMPAIGN COMPLETE
========================================================= */

app.post(
    "/api/campaign/complete",
    (req, res) => {

        try {

            const account =
                requireAccount(
                    req.body.accountId
                );

            const mapId =
                Number(
                    req.body.mapId
                );

            const campaign =
                GAME_DATA.campaign.find(
                    x => x.id === mapId
                );

            if (!campaign) {

                return res.status(404).json({
                    message:
                        "Campaign không tồn tại."
                });

            }

            if (
                account.completedCampaign
                    .includes(mapId)
            ) {

                return res.status(400).json({
                    message:
                        "Campaign này đã hoàn thành."
                });

            }

            if (
                mapId > 1 &&
                !account.completedCampaign.includes(
                    mapId - 1
                )
            ) {

                return res.status(400).json({
                    message:
                        "Bạn chưa mở khóa Campaign này."
                });

            }

            account.completedCampaign.push(
                mapId
            );

            account.gold += campaign.reward;

            saveDB();

            return res.json({
                message:
                    "Campaign hoàn thành.",
                reward:
                    campaign.reward,
                account:
                    publicAccount(account)
            });

        } catch (error) {

            return res.status(
                error.status || 500
            ).json({
                message:
                    error.message
            });
        }

    }
);

/* =========================================================
 MISSION COMPLETE
========================================================= */

app.post(
    "/api/mission/complete",
    (req, res) => {

        try {

            const account =
                requireAccount(
                    req.body.accountId
                );

            const missionId =
                Number(
                    req.body.missionId
                );

            const mission =
                GAME_DATA.missions.find(
                    x => x.id === missionId
                );

            if (!mission) {

                return res.status(404).json({
                    message:
                        "Mission không tồn tại."
                });

            }

            if (
                account.completedMissions
                    .includes(missionId)
            ) {

                return res.status(400).json({
                    message:
                        "Mission này đã hoàn thành."
                });

            }

            if (
                missionId > 1 &&
                !account.completedMissions.includes(
                    missionId - 1
                )
            ) {

                return res.status(400).json({
                    message:
                        "Bạn chưa mở khóa Mission này."
                });

            }

            account.completedMissions.push(
                missionId
            );

            account.gold += mission.reward;

            saveDB();

            return res.json({
                message:
                    "Mission hoàn thành.",
                reward:
                    mission.reward,
                account:
                    publicAccount(account)
            });

        } catch (error) {

            return res.status(
                error.status || 500
            ).json({
                message:
                    error.message
            });
        }

    }
);

/* =========================================================
 ARMOR UNLOCK
========================================================= */

app.post(
    "/api/armor/unlock",
    (req, res) => {

        try {

            const account =
                requireAccount(
                    req.body.accountId
                );

            const armorId =
                Number(
                    req.body.armorId
                );

            const armor =
                GAME_DATA.armors.find(
                    x => x.id === armorId
                );

            if (!armor) {

                return res.status(404).json({
                    message:
                        "Armor không tồn tại."
                });

            }

            if (
                account.ownedArmors
                    .includes(armorId)
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

            saveDB();

            return res.json({
                message:
                    "Đã mở khóa armor.",
                armor,
                account:
                    publicAccount(account)
            });

        } catch (error) {

            return res.status(
                error.status || 500
            ).json({
                message:
                    error.message
            });
        }

    }
);

/* =========================================================
 ARMOR EQUIP
========================================================= */

app.post(
    "/api/armor/equip",
    (req, res) => {

        try {

            const account =
                requireAccount(
                    req.body.accountId
                );

            const armorId =
                Number(
                    req.body.armorId
                );

            const armor =
                GAME_DATA.armors.find(
                    x => x.id === armorId
                );

            if (!armor) {

                return res.status(404).json({
                    message:
                        "Armor không tồn tại."
                });

            }

            if (
                !account.ownedArmors
                    .includes(armorId)
            ) {

                return res.status(403).json({
                    message:
                        "Bạn chưa sở hữu armor này."
                });

            }

            account.equippedArmor =
                armorId;

            saveDB();

            return res.json({
                message:
                    "Đã trang bị armor.",
                armor,
                account:
                    publicAccount(account)
            });

        } catch (error) {

            return res.status(
                error.status || 500
            ).json({
                message:
                    error.message
            });
        }

    }
);

/* =========================================================
 SPELL UNLOCK
========================================================= */

app.post(
    "/api/spell/unlock",
    (req, res) => {

        try {

            const account =
                requireAccount(
                    req.body.accountId
                );

            const spellId =
                Number(
                    req.body.spellId
                );

            const spell =
                GAME_DATA.spells.find(
                    x => x.id === spellId
                );

            if (!spell) {

                return res.status(404).json({
                    message:
                        "Spell không tồn tại."
                });

            }

            if (
                account.ownedSpells
                    .includes(spellId)
            ) {

                return res.status(400).json({
                    message:
                        "Bạn đã sở hữu spell này."
                });

            }

            const cost =
                spellId * 1000;

            if (account.gold < cost) {

                return res.status(400).json({
                    message:
                        "Không đủ Gold."
                });

            }

            account.gold -= cost;

            account.ownedSpells.push(
                spellId
            );

            saveDB();

            return res.json({
                message:
                    "Đã mở khóa spell.",
                spell,
                account:
                    publicAccount(account)
            });

        } catch (error) {

            return res.status(
                error.status || 500
            ).json({
                message:
                    error.message
            });
        }

    }
);

/* =========================================================
 SPELL EQUIP
========================================================= */

app.post(
    "/api/spell/equip",
    (req, res) => {

        try {

            const account =
                requireAccount(
                    req.body.accountId
                );

            const spellId =
                Number(
                    req.body.spellId
                );

            const spell =
                GAME_DATA.spells.find(
                    x => x.id === spellId
                );

            if (!spell) {

                return res.status(404).json({
                    message:
                        "Spell không tồn tại."
                });

            }

            if (
                !account.ownedSpells
                    .includes(spellId)
            ) {

                return res.status(403).json({
                    message:
                        "Bạn chưa sở hữu spell này."
                });

            }

            if (
                !account.equippedSpells
                    .includes(spellId)
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

            saveDB();

            return res.json({
                message:
                    "Đã trang bị spell.",
                spell,
                account:
                    publicAccount(account)
            });

        } catch (error) {

            return res.status(
                error.status || 500
            ).json({
                message:
                    error.message
            });
        }

    }
);

/* =========================================================
 LEADERBOARD
========================================================= */

app.get(
    "/api/leaderboard",
    (req, res) => {

        const leaderboard =
            database.accounts
                .filter(
                    account =>
                        !account.banned
                )
                .sort(
                    (a, b) =>
                        Number(b.gold) -
                        Number(a.gold)
                )
                .slice(0, 100)
                .map(
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

        try {

            const account =
                requireAccount(
                    req.body.accountId
                );

            const code =
                String(
                    req.body.code || ""
                )
                    .trim()
                    .toUpperCase();

            if (!code) {

                return res.status(400).json({
                    message:
                        "Hãy nhập code."
                });

            }

            /*
            Nếu chưa có code nào trong DB,
            server tự có một số code mặc định.
            */

            if (
                Object.keys(
                    database.redeemCodes
                ).length === 0
            ) {

                database.redeemCodes = {

                    SWUL2026: {
                        gold: 5000,
                        gems: 100
                    },

                    ULTIMATE: {
                        gold: 10000,
                        gems: 250
                    },

                    LEGENDS: {
                        gold: 25000,
                        gems: 500
                    }

                };
            }

            const reward =
                database.redeemCodes[code];

            if (!reward) {

                return res.status(400).json({
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
                account.redeemedCodes
                    .includes(code)
            ) {

                return res.status(400).json({
                    message:
                        "Bạn đã sử dụng code này."
                });

            }

            account.gold +=
                Number(reward.gold) || 0;

            account.gems +=
                Number(reward.gems) || 0;

            account.redeemedCodes.push(
                code
            );

            saveDB();

            return res.json({
                message:
                    "Redeem thành công.",
                reward: {
                    gold:
                        Number(reward.gold) || 0,
                    gems:
                        Number(reward.gems) || 0
                },
                account:
                    publicAccount(account)
            });

        } catch (error) {

            return res.status(
                error.status || 500
            ).json({
                message:
                    error.message
            });
        }

    }
);

/* =========================================================
 APPEAL
========================================================= */

app.post(
    "/api/appeal",
    (req, res) => {

        try {

            const account =
                findAccountById(
                    req.body.accountId
                );

            if (!account) {

                return res.status(404).json({
                    message:
                        "Không tìm thấy tài khoản."
                });

            }

            const message =
                String(
                    req.body.message || ""
                ).trim();

            if (!message) {

                return res.status(400).json({
                    message:
                        "Nội dung appeal không được trống."
                });

            }

            if (message.length > 5000) {

                return res.status(400).json({
                    message:
                        "Appeal tối đa 5000 ký tự."
                });

            }

            database.appeals.push({

                id:
                    database.appeals.length > 0
                        ? Math.max(
                            ...database.appeals
                                .map(x => Number(x.id) || 0)
                        ) + 1
                        : 1,

                accountId:
                    account.id,

                username:
                    account.username,

                message,

                status:
                    "pending",

                createdAt:
                    new Date().toISOString(),

                resolvedAt:
                    null
            });

            saveDB();

            return res.status(201).json({
                message:
                    "Appeal đã được gửi."
            });

        } catch (error) {

            return res.status(500).json({
                message:
                    "Không thể gửi appeal."
            });
        }

    }
);

/* =========================================================
 ADMIN ACCOUNTS
========================================================= */

app.get(
    "/api/admin/accounts",
    (req, res) => {

        try {

            requireAdmin(
                req.query.accountId
            );

            const accounts =
                database.accounts.map(
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
                            Boolean(
                                account.banned
                            )
                    })
                );

            return res.json({
                accounts
            });

        } catch (error) {

            return res.status(
                error.status || 500
            ).json({
                message:
                    error.message
            });
        }

    }
);

/* =========================================================
 ADMIN GIFT
========================================================= */

app.post(
    "/api/admin/gift",
    (req, res) => {

        try {

            /*
            Frontend cũ chỉ gửi target accountId.
            Nhưng backend phải biết ai là admin.

            Vì vậy hỗ trợ:
                adminId

            và tạm hỗ trợ:
                accountId + targetAccountId

            */

            const adminId =
                req.body.adminId ||
                req.body.adminAccountId;

            const targetId =
                req.body.targetAccountId ||
                req.body.targetId ||
                req.body.accountId;

            /*
            Nếu frontend cũ chưa gửi adminId,
            không cho phép thực hiện gift.

            Đây là cố ý để người chơi không thể
            tự gửi request admin.
            */

            if (!adminId) {

                return res.status(401).json({
                    message:
                        "Thiếu quyền Admin. Vui lòng cập nhật index.html."
                });

            }

            requireAdmin(adminId);

            const target =
                findAccountById(
                    targetId
                );

            if (!target) {

                return res.status(404).json({
                    message:
                        "Không tìm thấy tài khoản đích."
                });

            }

            const gold =
                Math.max(
                    0,
                    Math.floor(
                        Number(req.body.gold) || 0
                    )
                );

            const gems =
                Math.max(
                    0,
                    Math.floor(
                        Number(req.body.gems) || 0
                    )
                );

            if (gold === 0 && gems === 0) {

                return res.status(400).json({
                    message:
                        "Gold và Gems phải lớn hơn 0."
                });

            }

            target.gold += gold;
            target.gems += gems;

            saveDB();

            return res.json({
                message:
                    "Gift thành công.",
                account:
                    publicAccount(target)
            });

        } catch (error) {

            return res.status(
                error.status || 500
            ).json({
                message:
                    error.message
            });
        }

    }
);

/* =========================================================
 ADMIN BAN
========================================================= */

app.post(
    "/api/admin/ban",
    (req, res) => {

        try {

            const adminId =
                req.body.adminId ||
                req.body.adminAccountId;

            const targetId =
                req.body.targetAccountId ||
                req.body.targetId ||
                req.body.accountId;

            requireAdmin(adminId);

            const target =
                findAccountById(
                    targetId
                );

            if (!target) {

                return res.status(404).json({
                    message:
                        "Không tìm thấy tài khoản."
                });

            }

            if (target.role === "admin") {

                return res.status(403).json({
                    message:
                        "Không thể ban tài khoản Admin."
                });

            }

            target.banned = true;

            saveDB();

            return res.json({
                message:
                    "Đã ban tài khoản."
            });

        } catch (error) {

            return res.status(
                error.status || 500
            ).json({
                message:
                    error.message
            });
        }

    }
);

/* =========================================================
 ADMIN UNBAN
========================================================= */

app.post(
    "/api/admin/unban",
    (req, res) => {

        try {

            const adminId =
                req.body.adminId ||
                req.body.adminAccountId;

            const targetId =
                req.body.targetAccountId ||
                req.body.targetId ||
                req.body.accountId;

            requireAdmin(adminId);

            const target =
                findAccountById(
                    targetId
                );

            if (!target) {

                return res.status(404).json({
                    message:
                        "Không tìm thấy tài khoản."
                });

            }

            target.banned = false;

            saveDB();

            return res.json({
                message:
                    "Đã unban tài khoản."
            });

        } catch (error) {

            return res.status(
                error.status || 500
            ).json({
                message:
                    error.message
            });
        }

    }
);

/* =========================================================
 ADMIN GLOBAL MESSAGE
========================================================= */

app.post(
    "/api/admin/global-message",
    (req, res) => {

        try {

            const adminId =
                req.body.adminId ||
                req.body.adminAccountId;

            requireAdmin(adminId);

            const message =
                String(
                    req.body.message || ""
                ).trim();

            if (message.length > 2000) {

                return res.status(400).json({
                    message:
                        "Thông báo tối đa 2000 ký tự."
                });

            }

            database.globalMessage =
                message;

            saveDB();

            return res.json({
                message:
                    "Đã cập nhật thông báo toàn server."
            });

        } catch (error) {

            return res.status(
                error.status || 500
            ).json({
                message:
                    error.message
            });
        }

    }
);

/* =========================================================
 ADMIN APPEALS
========================================================= */

app.get(
    "/api/admin/appeals",
    (req, res) => {

        try {

            requireAdmin(
                req.query.accountId
            );

            return res.json({
                appeals:
                    database.appeals
            });

        } catch (error) {

            return res.status(
                error.status || 500
            ).json({
                message:
                    error.message
            });
        }

    }
);

/* =========================================================
 ADMIN RESPOND APPEAL
========================================================= */

app.post(
    "/api/admin/appeal/respond",
    (req, res) => {

        try {

            const adminId =
                req.body.accountId;

            requireAdmin(adminId);

            const appealId =
                Number(
                    req.body.appealId
                );

            const action =
                String(
                    req.body.action || ""
                ).toLowerCase();

            if (
                action !== "approve" &&
                action !== "reject"
            ) {

                return res.status(400).json({
                    message:
                        "Action không hợp lệ."
                });

            }

            const appeal =
                database.appeals.find(
                    x =>
                        Number(x.id) ===
                        appealId
                );

            if (!appeal) {

                return res.status(404).json({
                    message:
                        "Không tìm thấy appeal."
                });

            }

            if (
                appeal.status !== "pending"
            ) {

                return res.status(400).json({
                    message:
                        "Appeal này đã được xử lý."
                });

            }

            appeal.status =
                action === "approve"
                    ? "approved"
                    : "rejected";

            appeal.resolvedAt =
                new Date().toISOString();

            saveDB();

            return res.json({
                message:
                    "Đã xử lý appeal."
            });

        } catch (error) {

            return res.status(
                error.status || 500
            ).json({
                message:
                    error.message
            });
        }

    }
);

/* =========================================================
 GLOBAL MESSAGE GET
========================================================= */

app.get(
    "/api/global-message",
    (req, res) => {

        return res.json({
            message:
                database.globalMessage
        });

    }
);

/* =========================================================
 405 HANDLER
========================================================= */

app.use(
    "/api",
    (req, res) => {

        res.status(405).json({
            message:
                `Method ${req.method} không được hỗ trợ cho ${req.path}.`
        });

    }
);

/* =========================================================
 404 HANDLER
========================================================= */

app.use(
    (req, res) => {

        if (
            req.accepts("html") &&
            !req.path.startsWith("/api/")
        ) {

            return res.sendFile(
                path.join(
                    __dirname,
                    "index.html"
                )
            );
        }

        return res.status(404).json({
            message:
                "Không tìm thấy đường dẫn."
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

        if (
            error instanceof
            SyntaxError
        ) {

            return res.status(400).json({
                message:
                    "JSON không hợp lệ."
            });
        }

        return res.status(500).json({
            message:
                "Internal Server Error."
        });

    }
);

/* =========================================================
 START
========================================================= */

async function startServer() {

    await ensureAdmin();

    saveDB();

    app.listen(
        PORT,
        "0.0.0.0",
        () => {

            console.log("");
            console.log(
                "=============================================="
            );
            console.log(
                "⚔️ STICK WAR ULTIMATE LEGENDS"
            );
            console.log(
                "=============================================="
            );
            console.log(
                `Version : ${GAME_DATA.version}`
            );
            console.log(
                `Server  : http://localhost:${PORT}`
            );
            console.log(
                `Health  : http://localhost:${PORT}/api/health`
            );
            console.log(
                `Database: ${DB_FILE}`
            );
            console.log(
                "=============================================="
            );
            console.log("");
        }
    );
}

startServer().catch(
    error => {

        console.error(
            "Không thể khởi động server:",
            error
        );

        process.exit(1);
    }
);
