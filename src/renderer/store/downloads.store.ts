// TODO to implement

// this.downloads = computed(() => [...this.engine.currentDownloads, ...this.game.currentDownloads, ...this.maps.currentDownloads]);
// this.currentDownloadCurrent = computed(() => this.downloads.value.reduce((acc, cur) => acc + cur.currentBytes, 0));
// this.currentDownloadTotal = computed(() => this.downloads.value.reduce((acc, cur) => acc + cur.totalBytes, 0));
// this.currentDownloadPercent = computed(() => this.currentDownloadCurrent.value / this.currentDownloadTotal.value);

// TODO There was some lobby status to update when downloading stuff, should probably go into a lobby component or service of some sort and reacting to store changes

// this.engine.onDownloadStart.add((data) => {
//     const battle = api.session.onlineBattle.value;
//     const me = api.session.onlineUser;

//     if (battle && battle.battleOptions.engineVersion === data.name) {
//         api.comms.request("c.lobby.update_status", {
//             client: {
//                 sync: {
//                     engine: 0,
//                     game: me.battleStatus.sync.game,
//                     map: me.battleStatus.sync.map,
//                 },
//             },
//         });
//     }
// });

// this.engine.onDownloadComplete.add((data) => {
//     const battle = api.session.onlineBattle.value;
//     const me = api.session.onlineUser;

//     if (battle && battle.battleOptions.engineVersion === data.name) {
//         api.comms.request("c.lobby.update_status", {
//             client: {
//                 sync: {
//                     engine: 1,
//                     game: me.battleStatus.sync.game,
//                     map: me.battleStatus.sync.map,
//                 },
//             },
//         });
//     }
// });

// this.game.onDownloadStart.add((data) => {
//     const battle = api.session.onlineBattle.value;
//     const me = api.session.onlineUser;

//     if (battle && battle.battleOptions.gameVersion === data.name) {
//         api.comms.request("c.lobby.update_status", {
//             client: {
//                 sync: {
//                     engine: me.battleStatus.sync.engine,
//                     game: 0,
//                     map: me.battleStatus.sync.map,
//                 },
//             },
//         });
//     }
// });
// this.game.onDownloadComplete.add((data) => {
//     const battle = api.session.onlineBattle.value;
//     const me = api.session.onlineUser;

//     if (battle && battle.battleOptions.gameVersion === data.name) {
//         api.comms.request("c.lobby.update_status", {
//             client: {
//                 sync: {
//                     engine: me.battleStatus.sync.engine,
//                     game: 1,
//                     map: me.battleStatus.sync.map,
//                 },
//             },
//         });
//     }
// });

// this.maps.onDownloadStart.add((data) => {
//     const battle = api.session.onlineBattle.value;
//     const me = api.session.onlineUser;

//     if (battle && battle.battleOptions.map === data.name) {
//         api.comms.request("c.lobby.update_status", {
//             client: {
//                 sync: {
//                     engine: me.battleStatus.sync.engine,
//                     game: me.battleStatus.sync.game,
//                     map: 0,
//                 },
//             },
//         });
//     }
// });
// this.maps.onDownloadComplete.add((data) => {
//     const battle = api.session.onlineBattle.value;
//     const me = api.session.onlineUser;

//     if (battle && battle.battleOptions.map === data.name) {
//         api.comms.request("c.lobby.update_status", {
//             client: {
//                 sync: {
//                     engine: me.battleStatus.sync.engine,
//                     game: me.battleStatus.sync.game,
//                     map: 1,
//                 },
//             },
//         });
//     }
// });
