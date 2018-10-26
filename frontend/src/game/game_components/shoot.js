import Component from './component';
import Input from './input';
import Transform from './transform';
import Camera from './camera';
import Game from '../game';

class Shoot extends Component {

  start() {
    this.input = this.gameObject.getComponent(Input);
    this.camera = this.gameObject.getComponent(Camera);
    this.transform = this.requireComponent(Transform);
  }

  update() {
    if (this.input) {
      if ( this.input.shouldShoot()) {
        const dir = this.transform.getDirection();
        const rotation = this.transform.rotation;

        let options = {
          type: "bullet",
          position: this.transform.position.plus(dir.times(30)).toPOJO(),
          directionVector: dir.toPOJO(),
          rotation,
          shouldSave: false
        };
        Game.game.sendCreateToServer( options, true );

        const sound = new Audio("./sounds/bullet.mp3");
        sound.play();

      }
    }
  }
}

export default Shoot;
