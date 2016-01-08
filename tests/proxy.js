var _R = typeof require === 'function' ? require('./lib/reflect-helpers.js') : (typeof window !== 'undefined' ? window._R : null);


describe('_R.createProxy - ', function () {
    it('Circle class', function(){
        function Circle(r) {
            this.diameter = undefined; // property have to exist
            this.area = undefined; // property have to exist
            this.radius = r;
            return _R.createProxy(this, Circle.getter, Circle.setter);
        }

        Circle.getter = function circleGetter(originalObject, propertyName, proxyObject) {
            if (propertyName === 'radius') {
                return originalObject.radius;
            }
            if (propertyName === 'diameter') {
                return proxyObject.radius * 2;
            }
            if (propertyName === 'area') {
                return proxyObject.radius * proxyObject.radius * Math.PI;
            }
        };
        Circle.setter = function circleSetter(orig, propertyName, propertyValue, proxy) {
            if (propertyName !== 'radius') {
                throw Error('You can not modify anything in circle except radius');
            } else {
                return orig.radius = propertyValue;
            }
        };
        var k = new Circle(5);
        expect(k.radius * 2)
            .toEqual(k.diameter);

        var _diameter = k.diameter;
        try {
            k.diameter = 7; // Error: You can not modify anything in circle except radius
            throw new TypeError('AAA');
        } catch (e) {
            if (e.message === 'You can not modify anything in circle except radius') {
                expect(_diameter).toEqual(k.diameter);
            } else {
                throw new Error('Modification of k.diameter did not throw error');
            }
        }
        k.radius = 11;
        expect(k.radius).toEqual(11);
        expect(k.radius * 2)
            .toEqual(k.diameter);
    });
});


















