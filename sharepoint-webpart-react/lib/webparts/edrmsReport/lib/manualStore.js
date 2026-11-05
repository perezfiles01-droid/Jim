import { __assign, __awaiter, __generator } from "tslib";
/*
 * Where imported manual data lives in SharePoint (5 Nov 2026).
 *
 * A hidden document library "EDRMS Manual Data" on the report's own site holds
 *   current.json   the counts per unit and the site list the report reads
 *   history.json   the last 100 imports, loaded and refused
 * When an Owner first imports, the library is created with its own
 * permissions: Owners keep Full Control, Members are set to Read. So only
 * Owners and site collection admins can change the data, even outside the
 * report; everyone who can see the site can read it.
 * No names or emails are ever written here.
 */
import { SPHttpClient } from '@microsoft/sp-http';
var LIB_TITLE = 'EDRMS Manual Data';
var LIB_URL = 'EDRMSManualData';
var JSON_HEAD = { Accept: 'application/json;odata=nometadata', 'Content-Type': 'application/json;odata=nometadata', 'odata-version': '' };
export function createManualStore(http, webUrl, webRelUrl) {
    var _this = this;
    var api = webUrl.replace(/\/$/, '') + '/_api/web';
    var folder = (webRelUrl === '/' ? '' : webRelUrl.replace(/\/$/, '')) + '/' + LIB_URL;
    var esc = function (s) { return s.replace(/'/g, "''"); };
    var get = function (u) { return http.get(u, SPHttpClient.configurations.v1, { headers: { Accept: 'application/json;odata=nometadata' } }); };
    var post = function (u, body, headers) {
        return http.post(u, SPHttpClient.configurations.v1, { headers: headers || JSON_HEAD, body: body });
    };
    var ok = function (r, what) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (!r.ok)
                throw new Error(what + ' (SharePoint answered ' + r.status + ')');
            return [2 /*return*/, r];
        });
    }); };
    var readJson = function (name) { return __awaiter(_this, void 0, void 0, function () {
        var r, _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0: return [4 /*yield*/, get(api + "/GetFileByServerRelativeUrl('" + esc(folder + '/' + name) + "')/$value")];
                case 1:
                    r = _d.sent();
                    if (r.status === 404 || r.status === 400)
                        return [2 /*return*/, null];
                    if (!r.ok)
                        throw new Error('Could not read ' + name + ' (' + r.status + ')');
                    _d.label = 2;
                case 2:
                    _d.trys.push([2, 4, , 5]);
                    _b = (_a = JSON).parse;
                    return [4 /*yield*/, r.text()];
                case 3: return [2 /*return*/, _b.apply(_a, [_d.sent()])];
                case 4:
                    _c = _d.sent();
                    return [2 /*return*/, null];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var writeJson = function (name, value) { return __awaiter(_this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = ok;
                    return [4 /*yield*/, post(api + "/GetFolderByServerRelativeUrl('" + esc(folder) + "')/Files/add(url='" + name + "',overwrite=true)", JSON.stringify(value), { Accept: 'application/json;odata=nometadata', 'Content-Type': 'application/octet-stream', 'odata-version': '' })];
                case 1: return [4 /*yield*/, _a.apply(void 0, [_b.sent(), 'Could not save ' + name])];
                case 2:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    /** Creates the library on first use and limits Members to Read. */
    var ensureLibrary = function () { return __awaiter(_this, void 0, void 0, function () {
        var r, _a, _b, list, _c, members, m, reader, _i, _d, t, rd, d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0: return [4 /*yield*/, get(api + "/lists/getbytitle('" + esc(LIB_TITLE) + "')?$select=Id")];
                case 1:
                    r = _e.sent();
                    if (r.ok)
                        return [2 /*return*/];
                    _a = ok;
                    return [4 /*yield*/, post(api + '/lists', JSON.stringify({ Title: LIB_URL, BaseTemplate: 101, Hidden: true, Description: 'Manual data for the EDRMS Utilization Report. Changed only through the report\'s Import data.' }))];
                case 2: return [4 /*yield*/, _a.apply(void 0, [_e.sent(), 'Could not create the data library'])];
                case 3:
                    _e.sent();
                    _b = ok;
                    return [4 /*yield*/, post(api + "/lists/getbytitle('" + LIB_URL + "')", JSON.stringify({ Title: LIB_TITLE }), __assign(__assign({}, JSON_HEAD), { 'IF-MATCH': '*', 'X-HTTP-Method': 'MERGE' }))];
                case 4: 
                // Created under its URL name, then given its display title.
                return [4 /*yield*/, _b.apply(void 0, [_e.sent(), 'Could not name the data library'])];
                case 5:
                    // Created under its URL name, then given its display title.
                    _e.sent();
                    list = api + "/lists/getbytitle('" + esc(LIB_TITLE) + "')";
                    _c = ok;
                    return [4 /*yield*/, post(list + '/breakroleinheritance(copyRoleAssignments=true,clearSubscopes=true)')];
                case 6: return [4 /*yield*/, _c.apply(void 0, [_e.sent(), 'Could not set the library permissions'])];
                case 7:
                    _e.sent();
                    return [4 /*yield*/, get(api + '/AssociatedMemberGroup?$select=Id')];
                case 8:
                    members = _e.sent();
                    if (!members.ok) return [3 /*break*/, 19];
                    return [4 /*yield*/, members.json()];
                case 9:
                    m = _e.sent();
                    return [4 /*yield*/, get(api + '/RoleDefinitions/GetByType(2)?$select=Id')];
                case 10: return [4 /*yield*/, (_e.sent()).json()];
                case 11:
                    reader = _e.sent();
                    _i = 0, _d = [3, 6];
                    _e.label = 12;
                case 12:
                    if (!(_i < _d.length)) return [3 /*break*/, 17];
                    t = _d[_i];
                    return [4 /*yield*/, get(api + '/RoleDefinitions/GetByType(' + t + ')?$select=Id')];
                case 13:
                    rd = _e.sent();
                    if (!rd.ok) return [3 /*break*/, 16];
                    return [4 /*yield*/, rd.json()];
                case 14:
                    d = _e.sent();
                    return [4 /*yield*/, post(list + '/RoleAssignments/RemoveRoleAssignment(principalid=' + m.Id + ',roledefid=' + d.Id + ')')];
                case 15:
                    _e.sent();
                    _e.label = 16;
                case 16:
                    _i++;
                    return [3 /*break*/, 12];
                case 17: return [4 /*yield*/, post(list + '/RoleAssignments/AddRoleAssignment(principalid=' + m.Id + ',roledefid=' + reader.Id + ')')];
                case 18:
                    _e.sent();
                    _e.label = 19;
                case 19: return [2 /*return*/];
            }
        });
    }); };
    var addHistory = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var h;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, readJson('history.json')];
                case 1:
                    h = (_a.sent()) || [];
                    h.unshift(e);
                    return [4 /*yield*/, writeJson('history.json', h.slice(0, 100))];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    return {
        load: function () { return readJson('current.json').catch(function () { return null; }); },
        history: function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, readJson('history.json').catch(function () { return null; })];
                case 1: return [2 /*return*/, (_a.sent()) || []];
            }
        }); }); },
        save: function (data) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, ensureLibrary()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, writeJson('current.json', data)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, addHistory({ at: data.importedAt, by: data.importedBy, fileName: data.fileName, status: 'loaded',
                                sites: data.sites.length, people: Object.keys(data.units).reduce(function (a, k) { return a + data.units[k].headcount; }, 0),
                                units: Object.keys(data.units).length, problems: 0 })];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); },
        logRefused: function (fileName, by, issues) { return __awaiter(_this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, ensureLibrary()];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, addHistory({ at: new Date().toISOString(), by: by, fileName: fileName, status: 'refused', sites: 0, people: 0, units: 0, problems: issues.length })];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        _a = _b.sent();
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); }
    };
}
//# sourceMappingURL=manualStore.js.map