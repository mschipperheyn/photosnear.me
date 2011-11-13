YUI.add('grid-view', function (Y) {

Y.GridView = Y.Base.create('gridView', Y.View, [], {

    template     : Y.Handlebars.compile(Y.one('#grid-template').getContent()),
    photoTemplate: Y.Handlebars.compile(Y.one('#grid-photo-template').getContent()),

    events: {
        '.photo': {click: 'select'}
    },

    initializer: function (config) {
        var photos = this.get('modelList');

        photos.after('reset', this.render, this);

        this.loadingNode     = null;
        this._maxKnownHeight = 0;

        this.publish('more', {preventable: false});

        Y.one('win').on(['scroll', 'resize'], this.more, this);
    },

    create: function () {
        return Y.Node.create('<div id="photos" />');
    },

    render: function () {
        var photos    = this.get('modelList'),
            container = this.get('container');

        container.setContent(this.template({
            photos: photos.map(function (photo) {
                return {
                    clientId: photo.get('clientId'),
                    pageUrl : '/photo/' + photo.get('id') + '/',
                    thumbUrl: photo.get('thumbUrl')
                };
            })
        }, {
            partials: {photo: this.photoTemplate}
        }));

        this.loadingNode = container.one('.loading');

        Y.later(1, this, 'more');

        return this;
    },

    more: function (e) {
        var viewportBottom = Y.DOM.viewportRegion().bottom,
            maxKnowHeight  = this._maxKnownHeight,
            containerBottom;

        if (viewportBottom <= maxKnowHeight) { return; }

        containerBottom = this.get('container').get('region').bottom;

        if ((viewportBottom + 150) > containerBottom && containerBottom > maxKnowHeight) {
            this._maxKnownHeight = containerBottom;
            this.loadingNode.show();
            this.fire('more');
        }
    },

    select: function (e) {
        this.get('container').all('.photo.selected').removeClass('selected');
        e.currentTarget.addClass('selected');
    },

    reset: function () {
        this._maxKnownHeight = 0;
        this.get('container').all('.photo.selected').removeClass('selected');
        return this;
    }

});

}, '0.4.0', {
    requires: [ 'handlebars'
              , 'node-style'
              , 'node-screen'
              , 'photos'
              , 'view'
              ]
});
