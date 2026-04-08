"use strict";
/**
 * Tu Potencial — RevenueCat Webhooks Worker
 * Handles RevenueCat subscription lifecycle events and mirrors access into Supabase.
 *
 * Required secrets (set via `wrangler secret put`):
 *   - SUPABASE_SERVICE_ROLE_KEY
 *   - REVENUECAT_WEBHOOK_AUTH
 *
 * Required vars:
 *   - SUPABASE_URL
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var CORE_ENTITLEMENT_ID = 'core';
var UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function supabase(env) {
    var base = "".concat(env.SUPABASE_URL, "/rest/v1");
    var headers = {
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: "Bearer ".concat(env.SUPABASE_SERVICE_ROLE_KEY),
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
    };
    return {
        select: function (table, query) {
            return __awaiter(this, void 0, void 0, function () {
                var res;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, fetch("".concat(base, "/").concat(table, "?").concat(query), { headers: headers })];
                        case 1:
                            res = _a.sent();
                            return [2 /*return*/, res.json()];
                    }
                });
            });
        },
        upsert: function (table, body, onConflict) {
            return __awaiter(this, void 0, void 0, function () {
                var prefer, url, res;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            prefer = onConflict
                                ? 'return=representation,resolution=merge-duplicates'
                                : 'return=representation';
                            url = onConflict ? "".concat(base, "/").concat(table, "?on_conflict=").concat(onConflict) : "".concat(base, "/").concat(table);
                            return [4 /*yield*/, fetch(url, {
                                    method: 'POST',
                                    headers: __assign(__assign({}, headers), { Prefer: prefer }),
                                    body: JSON.stringify(body),
                                })];
                        case 1:
                            res = _a.sent();
                            return [2 /*return*/, res.json()];
                    }
                });
            });
        },
        delete: function (table, query) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, fetch("".concat(base, "/").concat(table, "?").concat(query), {
                                method: 'DELETE',
                                headers: headers,
                            })];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        },
    };
}
exports.default = {
    fetch: function (request, env) {
        return __awaiter(this, void 0, void 0, function () {
            var url;
            return __generator(this, function (_a) {
                url = new URL(request.url);
                if (request.method === 'OPTIONS') {
                    return [2 /*return*/, new Response(null, {
                            headers: corsHeaders(),
                        })];
                }
                if (request.method === 'GET' && url.pathname === '/health') {
                    return [2 /*return*/, jsonResponse({ ok: true })];
                }
                if (request.method === 'POST' && url.pathname === '/webhook') {
                    return [2 /*return*/, handleWebhook(request, env)];
                }
                return [2 /*return*/, new Response('Not Found', { status: 404, headers: corsHeaders() })];
            });
        });
    },
};
function handleWebhook(request, env) {
    return __awaiter(this, void 0, void 0, function () {
        var payload, event, db, existing, userId, access;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (request.headers.get('authorization') !== env.REVENUECAT_WEBHOOK_AUTH) {
                        return [2 /*return*/, jsonResponse({ error: 'Unauthorized' }, 401)];
                    }
                    return [4 /*yield*/, request.json().catch(function () { return null; })];
                case 1:
                    payload = _d.sent();
                    event = payload === null || payload === void 0 ? void 0 : payload.event;
                    if (!(event === null || event === void 0 ? void 0 : event.id) || !event.type) {
                        return [2 /*return*/, jsonResponse({ error: 'Invalid payload' }, 400)];
                    }
                    db = supabase(env);
                    return [4 /*yield*/, db.select('revenuecat_webhook_events', "id=eq.".concat(encodeURIComponent(event.id), "&select=id"))];
                case 2:
                    existing = _d.sent();
                    if (existing === null || existing === void 0 ? void 0 : existing.length) {
                        return [2 /*return*/, jsonResponse({ received: true, skipped: 'already processed' })];
                    }
                    userId = resolveUserId(event);
                    if (!userId) {
                        return [2 /*return*/, jsonResponse({ received: true, skipped: 'no_supabase_user_id' })];
                    }
                    access = computeAccess(event);
                    return [4 /*yield*/, db.upsert('subscriptions', {
                            user_id: userId,
                            status: access.status,
                            current_period_end: access.currentPeriodEnd,
                            updated_at: new Date().toISOString(),
                        }, 'user_id')];
                case 3:
                    _d.sent();
                    if (!access.isActive) return [3 /*break*/, 5];
                    return [4 /*yield*/, db.upsert('user_entitlements', {
                            user_id: userId,
                            entitlement_key: CORE_ENTITLEMENT_ID,
                            source: 'subscription',
                            source_ref: "revenuecat:".concat(event.id),
                        }, 'user_id,entitlement_key')];
                case 4:
                    _d.sent();
                    return [3 /*break*/, 7];
                case 5: return [4 /*yield*/, db.delete('user_entitlements', "user_id=eq.".concat(userId, "&entitlement_key=eq.").concat(CORE_ENTITLEMENT_ID, "&source=eq.subscription"))];
                case 6:
                    _d.sent();
                    _d.label = 7;
                case 7: return [4 /*yield*/, db.upsert('revenuecat_webhook_events', {
                        id: event.id,
                        app_user_id: (_a = event.app_user_id) !== null && _a !== void 0 ? _a : null,
                        event_type: event.type,
                        environment: (_b = event.environment) !== null && _b !== void 0 ? _b : null,
                        store: (_c = event.store) !== null && _c !== void 0 ? _c : null,
                        payload: payload,
                    }, 'id')];
                case 8:
                    _d.sent();
                    return [2 /*return*/, jsonResponse({ received: true })];
            }
        });
    });
}
function resolveUserId(event) {
    var _a, _b, _c;
    var candidates = __spreadArray(__spreadArray(__spreadArray([
        event.app_user_id,
        event.original_app_user_id
    ], ((_a = event.aliases) !== null && _a !== void 0 ? _a : []), true), ((_b = event.transferred_to) !== null && _b !== void 0 ? _b : []), true), ((_c = event.transferred_from) !== null && _c !== void 0 ? _c : []), true);
    for (var _i = 0, candidates_1 = candidates; _i < candidates_1.length; _i++) {
        var candidate = candidates_1[_i];
        if (candidate && UUID_RE.test(candidate)) {
            return candidate;
        }
    }
    return null;
}
function computeAccess(event) {
    var entitlementIds = Array.isArray(event.entitlement_ids) ? event.entitlement_ids : [];
    var hasCore = entitlementIds.includes(CORE_ENTITLEMENT_ID);
    var expirationAt = typeof event.expiration_at_ms === 'number'
        ? new Date(event.expiration_at_ms).toISOString()
        : null;
    var isExpired = typeof event.expiration_at_ms === 'number'
        ? event.expiration_at_ms <= Date.now()
        : false;
    var isActive = hasCore && !isExpired;
    var status = isActive
        ? event.period_type === 'TRIAL'
            ? 'trialing'
            : 'active'
        : 'canceled';
    return {
        isActive: isActive,
        status: status,
        currentPeriodEnd: expirationAt,
    };
}
function jsonResponse(data, status) {
    if (status === void 0) { status = 200; }
    return new Response(JSON.stringify(data), {
        status: status,
        headers: __assign(__assign({}, corsHeaders()), { 'Content-Type': 'application/json' }),
    });
}
function corsHeaders() {
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
}
