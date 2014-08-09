var searcher = {
    searchInput: null,
    searchResults: null,

    bindToSearch: function (searchInputSelector, searchResultsSelector) {
        this.searchInput = $(searchInputSelector);
        $(this.searchInput).bind('keypress', this.isEnter);
        this.searchResults = $(searchResultsSelector);
    },

    startSearch: function (terms) {
        var self = this;
        this.callSearch(terms).done(
            function (data) {
                self.displayResults(data.RelatedTopics);
            }
        ).fail(
            function( p1, message){
                self.displayMessage(message);
            }
        );
    },

    callSearch: function (terms) {
        var duckUrl = 'http://api.duckduckgo.com';
        return $.ajax({
            type: 'GET',
            url: duckUrl,
            data: {
                q: terms,
                format: 'json',
                pretty: 1
            },
            jsonpCallback: 'jsonp',
            dataType: 'jsonp'
        });
    },

    displayResults: function (topics) {
        $(this.searchResults).html('<br/>');
        for (var topic in topics) {
            if(topics[topic].Result!==undefined){
                $(this.searchResults).append(topics[topic].Result+'<br/><br/>');
            }
        }
    },

    displayMessage: function (message) {
        $(this.searchResults).html(message);
    },

    isEnter: function (ev) {
        if (ev) {
            var charCode = ev.keyCode || ev.which;
            if (charCode == 13) {
                searcher.startSearch($(this).val());
                return false;
            }
        }
    }

}