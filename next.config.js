const path = require('path');
const { loadEnvConfig } = require('@next/env');

// يحمّل .env و .env.local من جذر المشروع قبل باقي الإعدادات (يقلّل حالات "المفتاح غير مقروء").
loadEnvConfig(path.join(__dirname));

/** @type {import('next').NextConfig} */
const nextConfig = {};

module.exports = nextConfig;
