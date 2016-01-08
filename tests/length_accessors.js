var _R = typeof require === 'function' ? require('./lib/reflect-helpers.js') : (typeof window !== 'undefined' ? window._R : null);


describe('_R.addMagicLengthProperty - ', function () {
    it('Works properly as direct getter', function(){
        var what = {0: 1, 1: 2, 2: 3, 3: 4, 5:6};
        _R.addMagicLengthProperty(what);
        expect(what.length).toEqual(6);
    });
    it('Works properly as prototype getter', function(){
        var proto = {};
        var what = Object.create(proto);
        what[6]=1;
        _R.addMagicLengthProperty(proto);
        expect(what.length).toEqual(7);
    });
    it('Works properly as direct setter', function(){
        var what = {0: 1, 1: 2, 2: 3, 3: 4, 5:6};
        _R.addMagicLengthProperty(what, false);
        what.length = 0;
        expect(what.length).toEqual(0);
    });
    it('Works properly as prototype setter', function(){
        var proto = {};
        var what = Object.create(proto);
        what[6]=1;
        _R.addMagicLengthProperty(proto, false);
        what.length = 0;
        expect(what.length).toEqual(0);
    });
});
