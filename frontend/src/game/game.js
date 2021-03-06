import Syncronizer from './syncronizer';
import Time from './time';
import Camera from './game_components/camera';
import { gameOver } from '../actions/game_actions';
import { clearPlayers } from '../actions/player_actions';
import { receiveStats } from '../actions/stats_actions';
import { nullStats } from '../reducers/stats_reducer';
import getId from './get_id';
import GameObject from './game_objects/game_object';
import PlayersAliveRenderer from './renderers/players_alive_renderer';
import { win } from '../actions/game_actions';
import Count from './game_components/count';

class Game {
  constructor(
    ctx,
    clientId,
    updateServerCallback,
    createOnServerCallback,
    gameOverCallback,
    winCallback,
    dispatch
  ) {
    Game.game = this;
    this.over = false;
    this.ctx = ctx;
    this.clientId = clientId;
    this.updateServerCallback = updateServerCallback;
    this.createOnServerCallback = createOnServerCallback;
    this.gameOverCallback = gameOverCallback;
    this.winCallback = winCallback;
    this.gameObjects = {};
    this.dispatch = dispatch;
    const playerCount = new GameObject(getId());
    playerCount.addComponent(new PlayersAliveRenderer(10));
    this.add(playerCount);
    this.networkInterval = setInterval(this.sendUpdateToServer.bind(this), 100);
    Time.update();
    this.updateInterval = setInterval(this.update.bind(this), 1000 / 60);
    window.requestAnimationFrame(this.draw.bind(this));
    this.winFlag = false;
    this.stats = nullStats();
  }

  add(gameObject) {
    this.gameObjects[gameObject.id] = gameObject;
  }

  endGame() {
    this.over = true;
    this.stats.rank = Count.get('players');
    Object.values(this.gameObjects).forEach(gameObject => gameObject.destroy());
    clearInterval(this.networkInterval);
    clearInterval(this.updateInterval);
    Game.game = null;
    this.gameOverCallback();
    this.dispatch(receiveStats(this.stats));
    this.dispatch(clearPlayers());
    this.dispatch(gameOver());
  }

  win() {
    setTimeout(() => {
      this.dispatch(win());
      this.winCallback();
      this.endGame();
    }, 1000);
  }

  sendUpdateToServer() {
    const packet = {};

    packet.data = {};
    packet.actions = [];
    Syncronizer.all().forEach(syncronizer => {
      if (syncronizer.owned) {
        const pack = syncronizer.pack();
        if (pack !== null) packet.data[syncronizer.id] = pack;
      }

      syncronizer.actions.forEach(action => {
        action.sender = this.clientId;
        packet.actions.push(action);
      });
      syncronizer.clearActions();
    });

    this.updateServerCallback(packet);
  }

  receiveUpdateFromServer(packet) {
    Object.keys(packet.data).forEach(syncronizerId => {
      const syncronizer = Syncronizer.find(syncronizerId);
      if (syncronizer !== undefined && !syncronizer.owned) {
        syncronizer.unpack(packet.data[syncronizerId]);
      }
    });

    packet.actions.forEach(action => {
      if (action.sender !== this.clientId) {
        const syncronizer = Syncronizer.find(action.syncronizerId);
        if (syncronizer !== undefined) {
          syncronizer.component.handleAction(action);
        }
      }
    });
  }

  update() {
    Time.update();
    Object.values(this.gameObjects).forEach(gameObject => {
      gameObject.components.forEach(component => {
        component.handleUpdating();
      });
    });
  }

  draw() {
    if (this.over) return;
    const canvas = document.getElementById("canvas");
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (Camera.camera) Camera.camera.draw(this.ctx);
    window.requestAnimationFrame(this.draw.bind(this));
  }

  sendCreateToServer(options, shouldOwn = false) {
    this.createOnServerCallback(options, shouldOwn);
  }

  destroy(gameObjectId) {
    const gameObject = this.gameObjects[gameObjectId];
    if (gameObject !== undefined) {
      gameObject.components.forEach(component => {
        if (component.syncronizer !== undefined) {
          component.syncronizer.destroy();
        }
      });
    }
    delete this.gameObjects[gameObjectId];
  }
}

Game.game = null;

export default Game;
