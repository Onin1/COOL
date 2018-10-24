import GameObject from './game_object';
import Transform from './transform';
import BulletRenderer from './renderers/bullet_renderer';
import Collider from './collider';
import Circle from './circle';
import BulletMovement from './bullet_movement';

const createBullet = ({ id, position, directionVector, rotation, owned }) => {
  const bullet = new GameObject(id, 2);
  const transform = new Transform(  position );
  bullet.addComponent(transform);
  bullet.addComponent(new Collider(new Circle(5)));
  bullet.addComponent(new BulletRenderer(rotation));
  bullet.addComponent(
    new BulletMovement(1200, directionVector.normalized().times(10))
  );
  return bullet;
};

export default createBullet;
