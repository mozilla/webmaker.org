define(['jquery', 'nunjucks', 'base/ui', 'moment'],
  function ($, nunjucks, UI, moment) {
    'use strict';

    var Gallery = function(options) {
      options = options || {};
      options.mainGallery = options.mainGallery || '.main-gallery';
      options.itemSelector = options.itemSelector || 'div.make';
      options.gutterSize = options.gutterSize || '.gutter-sizer';
      options.hiddenClass = options.hiddenClass || 'packery-hide';
      options.makeView = options.makeView || 'make-teach.html';
      options.makeUrl = options.makeUrl || $('body').data('endpoint') || 'https://makeapi.webmaker.org';
      options.defaultSearch = options.defaultSearch || 'webmaker:recommended';
      options.limit = options.limit || 12;

      var self = this;

      var banner = document.querySelector(options.banner),
          mainGallery = document.querySelector(options.mainGallery),
          $mainGallery = $(mainGallery),
          $loadMore = $('.load-more'),
          $loading = $('.loading-cat'),
          $emptyMessage = $('.no-makes-found');

      // MakeAPI

      var make = new Make({
          apiURL: options.makeUrl
        }),
        isLastPage = false,
        searchOptions = {
          limit: options.limit,
          sortByField: ['createdAt', 'desc'],
          page: 1
        };

      // Packery
      var packery = new Packery(mainGallery, {
        itemSelector: options.itemSelector,
        gutter: options.gutterSize
      });

      // Which items are large on the front page?
      var FRONTPAGE_LARGE = [2,3];

      // Nunjucks
      // Todo - nunjucks middleware
      var makeView = 'make-templates/' + options.makeView;
      nunjucks.env = new nunjucks.Environment(new nunjucks.HttpLoader('/views', true));

      function onLoadUI() {
        packery.off('layoutComplete', onLoadUI);
        $loading.fadeOut();
        $('.' + options.hiddenClass).removeClass(options.hiddenClass);
        if (isLastPage) {
          $loadMore.hide();
        } else {
          $loadMore.show();
        }
      }

      function generateGravatar(hash) {
        // TODO: Combine with makeapi-webmaker.js into universal module
        var DEFAULT_AVATAR = "https%3A%2F%2Fstuff.webmaker.org%2Favatars%2Fwebmaker-avatar-44x44.png",
          DEFAULT_SIZE = 44;
        return "https://secure.gravatar.com/avatar/" + hash + "?s=" + DEFAULT_SIZE + "&d=" + DEFAULT_AVATAR;
      }

      function resultsCallback(err, data, total) {
        var isStickySearch = (searchOptions.tagPrefix === options.stickyPrefix),
            itemString = '',
            frag = document.createElement('div'),
            allItems,
            i,
            l;

        $loading.hide();

        if (err || !data.length) {
          $emptyMessage.fadeIn();
          return;
        }

        isLastPage = searchOptions.page >= Math.ceil(total / searchOptions.limit);
        if (isStickySearch) {
          searchOptions.tags = options.defaultSearch;
          searchOptions.page = 0;
          isLastPage = false; //We always want to load more for stickies.
        }

        for (i = 0, l = data.length; i < l; i++) {
          if (data[i]) {
            if (data[i].tags.guide) {
              data[i].type = 'guide';
            } else {
              data[i].type = data[i].contentType.replace(/application\/x\-/g, '');
            }
            data[i].avatar = generateGravatar(data[i].emailHash);
            data[i].updatedAt = moment(data[i].updatedAt).fromNow();
            data[i].createdAt = moment(data[i].createdAt).fromNow();
            data[i].remixurl = data[i].url + '/remix';
            if (isStickySearch && FRONTPAGE_LARGE.indexOf(i) > -1) {
              data[i].size = "large";
            }
            itemString += nunjucks.env.render(makeView, {
              make: data[i]
            });
          }
        }
        frag.innerHTML = itemString;
        allItems = frag.querySelectorAll(options.itemSelector);
        $mainGallery.append(allItems);
        packery.appended(allItems);
        packery.layout();
        onLoadUI();
      }

      // Export
      self.searchOptions = searchOptions;
      self.packery = packery;
      self.make = make;
      self.search = function(opts) {
        opts = opts || {};
        if (opts.sticky) {
          searchOptions.tagPrefix = options.stickyPrefix;
        } else if (options.stickyPrefix) {
          searchOptions.tagPrefix = [options.stickyPrefix, true]; // NOT stickyPrefix
        }

        make.find(searchOptions).then(resultsCallback);
      };

      // Set up packery initially

      packery.on('layoutComplete', onLoadUI);
      if (banner) {
        packery.stamp(banner);
      }
      packery.layout();

      // Set up load more
      $loadMore.click(function() {
        searchOptions.page++;
        $loading.show();
        self.search({
          sticky: false
        });
      });

    };

    return Gallery;

  });
