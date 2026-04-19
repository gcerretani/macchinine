export class Input {
  constructor() {
    this.left = false;
    this.right = false;
    this.steer = 0;
    this._bindKeyboard();
    this._bindTouch();
  }

  _bindKeyboard() {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.right = true;
    });
    window.addEventListener('keyup', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.right = false;
    });
  }

  _bindTouch() {
    const leftZone = document.getElementById('touch-left');
    const rightZone = document.getElementById('touch-right');
    if (!leftZone || !rightZone) return;

    const press = (zone, key) => {
      zone.classList.add('active');
      this[key] = true;
    };
    const release = (zone, key) => {
      zone.classList.remove('active');
      this[key] = false;
    };

    const handlers = (zone, key) => {
      zone.addEventListener('touchstart', (e) => {
        e.preventDefault();
        press(zone, key);
      }, { passive: false });
      zone.addEventListener('touchend', (e) => {
        e.preventDefault();
        release(zone, key);
      }, { passive: false });
      zone.addEventListener('touchcancel', () => release(zone, key));
      zone.addEventListener('mousedown', (e) => {
        e.preventDefault();
        press(zone, key);
      });
      zone.addEventListener('mouseup', () => release(zone, key));
      zone.addEventListener('mouseleave', () => release(zone, key));
    };
    handlers(leftZone, 'left');
    handlers(rightZone, 'right');
  }

  update(dt) {
    const target = (this.left ? -1 : 0) + (this.right ? 1 : 0);
    // Smooth steering (lerp toward target)
    const rate = 8;
    this.steer += (target - this.steer) * Math.min(1, rate * dt);
  }

  reset() {
    this.left = this.right = false;
    this.steer = 0;
  }
}
