'javascript'
const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

/*
========================================================
⚔️ STICK WAR ULTIMATE LEGENDS
Backend v2026.27.8
========================================================

LƯU Ý:
Đây là backend nền để test API.
Database online thật sẽ được kết nối ở bước tiếp theo.
Không lưu password thật trong frontend.
*/

// ------------------------------------------------------
// TEMP DATABASE - CHỈ DÙNG ĐỂ TEST
// ------------------------------------------------------

const accounts = [
    {
        id: 1,
        username: "admin",
        password: "CHANGE_THIS_PASSWORD",
        role: "admin",
        gold: 999999999,
        gems: 999999999,
        banned: false,
        permanentBan: false,
        skins: [],
        campaignProgress: 0,
        missionProgress: 0
    }
];

const codes = [];

let globalMessage = "Welcome to Stick War Ultimate Legends!";

// ------------------------------------------------------
// HOME
// ------------------------------------------------------

app.get("/", (req, res) => {
    res.json({
        game: "Stick War Ultimate Legends",
        version: "2026.27.8",
        status: "online"
    });
});

// ------------------------------------------------------
// HEALTH CHECK
// ------------------------------------------------------

app.get("/api/status", (req, res) => {
    res.json({
        online: true,
        game: "SWUL",
        version: "2026.27.8"
    });
});

// ------------------------------------------------------
// REGISTER
// ------------------------------------------------------

app.post("/api/register", (req, res) => {

    const { username, password } = req.body;

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
        acc => acc.username.toLowerCase() === username.toLowerCase()
    );

    if (exists) {
        return res.status(409).json({
            success: false,
            message: "Account already exists."
        });
    }

    const account = {
        id: accounts.length + 1,
        username,
        password,
        role: "player",
        gold: 1000,
        gems: 100,
        banned: false,
        permanentBan: false,
        skins: [],
        campaignProgress: 0,
        missionProgress: 0
    };

    accounts.push(account);

    res.json({
        success: true,
        message: "Account created.",
        account: {
            id: account.id,
            username: account.username,
            role: account.role,
            gold: account.gold,
            gems: account.gems
        }
    });
});

// ------------------------------------------------------
// LOGIN
// ------------------------------------------------------

app.post("/api/login", (req, res) => {

    const { username, password } = req.body;

    const account = accounts.find(
        acc =>
            acc.username.toLowerCase() === String(username).toLowerCase() &&
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
            message: account.permanentBan
                ? "This account is permanently banned."
                : "This account is banned."
        });
    }

    res.json({
        success: true,
        account: {
            id: account.id,
            username: account.username,
            role: account.role,
            gold: account.gold,
            gems: account.gems,
            skins: account.skins,
            campaignProgress: account.campaignProgress,
            missionProgress: account.missionProgress
        }
    });
});

// ------------------------------------------------------
// GET ACCOUNTS - ADMIN
// ------------------------------------------------------

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

// ------------------------------------------------------
// ADMIN BAN
// ------------------------------------------------------

app.post("/api/admin/ban", (req, res) => {

    const { accountId, permanent } = req.body;

    const account = accounts.find(acc => acc.id === Number(accountId));

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

    if (permanent) {
        account.permanentBan = true;
        account.banned = true;
    } else {
        account.banned = true;
    }

    res.json({
        success: true,
        message: permanent
            ? "Permanent ban applied."
            : "Ban applied."
    });
});

// ------------------------------------------------------
// ADMIN UNBAN
// ------------------------------------------------------

app.post("/api/admin/unban", (req, res) => {

    const { accountId } = req.body;

    const account = accounts.find(acc => acc.id === Number(accountId));

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

// ------------------------------------------------------
// ADMIN GIFT
// ------------------------------------------------------

app.post("/api/admin/gift", (req, res) => {

    const {
        accountId,
        gold = 0,
        gems = 0,
        skin = null
    } = req.body;

    const account = accounts.find(acc => acc.id === Number(accountId));

    if (!account) {
        return res.status(404).json({
            success: false,
            message: "Account not found."
        });
    }

    account.gold += Number(gold) || 0;
    account.gems += Number(gems) || 0;

    if (skin && !account.skins.includes(skin)) {
        account.skins.push(skin);
    }

    res.json({
        success: true,
        message: "Gift sent.",
        account: {
            username: account.username,
            gold: account.gold,
            gems: account.gems,
            skins: account.skins
        }
    });
});

// ------------------------------------------------------
// CREATE CODE
// ------------------------------------------------------

app.post("/api/admin/create-code", (req, res) => {

    const {
        code,
        gold = 0,
        gems = 0,
        skin = null
    } = req.body;

    if (!code) {
        return res.status(400).json({
            success: false,
            message: "Code is required."
        });
    }

    const exists = codes.find(
        c => c.code.toLowerCase() === code.toLowerCase()
    );

    if (exists) {
        return res.status(409).json({
            success: false,
            message: "Code already exists."
        });
    }

    const newCode = {
        code,
        gold: Number(gold) || 0,
        gems: Number(gems) || 0,
        skin
    };

    codes.push(newCode);

    res.json({
        success: true,
        message: "Code created.",
        code: newCode
    });
});

// ------------------------------------------------------
// REDEEM CODE
// ------------------------------------------------------

app.post("/api/redeem-code", (req, res) => {

    const {
        accountId,
        code
    } = req.body;

    const account = accounts.find(acc => acc.id === Number(accountId));

    if (!account) {
        return res.status(404).json({
            success: false,
            message: "Account not found."
        });
    }

    const reward = codes.find(
        c => c.code.toLowerCase() === String(code).toLowerCase()
    );

    if (!reward) {
        return res.status(404).json({
            success: false,
            message: "Invalid code."
        });
    }

    account.gold += reward.gold;
    account.gems += reward.gems;

    if (reward.skin && !account.skins.includes(reward.skin)) {
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

// ------------------------------------------------------
// GLOBAL MESSAGE
// ------------------------------------------------------

app.get("/api/global-message", (req, res) => {

    res.json({
        success: true,
        message: globalMessage
    });
});

app.post("/api/admin/global-message", (req, res) => {

    const { message } = req.body;

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

// ------------------------------------------------------
// LEADERBOARD
// ------------------------------------------------------

app.get("/api/leaderboard", (req, res) => {

    const leaderboard = [...accounts]
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

// ------------------------------------------------------
// SERVER
// ------------------------------------------------------

app.listen(PORT, () => {
    console.log("=================================");
    console.log("⚔️ SWUL BACKEND ONLINE");
    console.log("Version: 2026.27.8");
    console.log(`Port: ${PORT}`);
    console.log("=================================");
});
