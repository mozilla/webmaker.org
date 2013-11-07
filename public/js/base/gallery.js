define(['jquery', 'nunjucks', 'base/ui', 'moment', 'makeapi', 'localized', 'masonry'],
  function ($, nunjucks, UI, moment, Make, localized, Masonry) {

    var DEFAULT_LIMIT = 12;
    var lang = $('html').attr('lang');
    moment.lang(localized.langToMomentJSLang(lang));
    var Gallery = function (options) {
      var self = this;

      options = options || {};
      options.mainGallery = options.mainGallery || '.main-gallery';
      options.itemSelector = options.itemSelector || 'div.make';
      options.gutterSize = options.gutterSize || '.gutter-sizer';
      options.hiddenClass = options.hiddenClass || 'gallery-hide';
      options.makeView = options.makeView || 'make-teach.html';
      options.makeUrl = options.makeUrl || $('body').data('endpoint') || 'https://makeapi.webmaker.org';
      options.defaultSearch = options.defaultSearch || 'webmaker:recommended';

      var banner = document.querySelector(options.banner),
        mainGallery = document.querySelector(options.mainGallery),
        $mainGallery = $(mainGallery),
        $loadMore = $('.load-more'),
        $loading = $('.loading-cat'),
        $emptyMessage = $('.no-makes-found');

      var limit = $mainGallery.data('limit') || DEFAULT_LIMIT;
      var totalHits = $mainGallery.data('total-hits');
      var isLastPage = totalHits <= limit;

      var toolURL = {
        "application/x-popcorn": "https://popcorn.webmaker.org",
        "application/x-thimble": "https://thimble.webmaker.org",
        "application/x-x-ray-goggles": "https://goggles.webmaker.org"
      };

      // MakeAPI

      var make = new Make({
        apiURL: options.makeUrl
      }),
        searchOptions = {
          limit: limit,
          tags: options.defaultSearch,
          sortByField: ['createdAt', 'desc'],
          page: 1
        };

      // Masonry
      var masonry = new Masonry(mainGallery, {
        itemSelector: options.itemSelector,
        gutter: options.gutterSize
      });

      // Which items are large on the front page?
      var FRONTPAGE_LARGE = [2, 3];

      // Nunjucks
      // Todo - nunjucks middleware
      var makeView = 'make-templates/' + options.makeView;
      nunjucks.env = new nunjucks.Environment(new nunjucks.HttpLoader('/views', true));

      // Making a custom filter to use it for the client-side l10n
      // Using this filter will help reduce the number of adding
      // variables to the global nunjucks variable.
      // The usage will be "{{ "some string" | gettext }}"
      nunjucks.env.addFilter('gettext', function (data) {
        return localized.get(data);
      });

      function onLoadUI() {
        masonry.off('layoutComplete', onLoadUI);
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

      function likeClickCallback(e) {
        e.preventDefault();
        e.stopPropagation();
        var $this = $(this),
          makeID = $this.data("make-id"),
          method;

        if ($this.hasClass("icon-heart")) {
          method = "/unlike";
        } else {
          method = "/like";
        }
        $.post(method, {
          makeID: makeID,
          _csrf: $("meta[name='X-CSRF-Token']").attr("content")
        }, function (res) {
          var newLen = res.likes.length,
            $count = $this.parent().parent().find(".like-count"),
            $text = $this.parent().parent().find(".like-text");

          $this.toggleClass("icon-heart icon-heart-empty");
          $count.html(newLen);
          if (newLen === 0) {
            $text.html(localized.get("Like-0"));
          } else if (newLen === 1) {
            $text.html(localized.get("Like-1"));
          } else {
            $text.html(localized.get("Like-n"));
          }
        }).fail(function (res) {
          if (res.status === 401) {
            window.location.replace(window.location.protocol + "//" + window.location.host +
              "/" + localized.getCurrentLang() + "/login");
          } else {
            // already like/unliked, update UI to reflect.
            $this.toggleClass("icon-heart icon-heart-empty");
          }
        });
      }

      function resultsCallback(err, data, total) {

        var isStickySearch = (searchOptions.tagPrefix === options.stickyPrefix),
          itemString = '',
          frag = document.createElement('div'),
          makerID = $("meta[name='maker-id']").attr("content"),
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

        function hasUserLikedCheck(like) {
          return like.userId === +makerID;
        }

        for (i = 0, l = data.length; i < l; i++) {
          if (data[i]) {
            if (data[i].taggedWithAny('guide')) {
              data[i].type = 'guide';
            } else if (data[i].taggedWithAny('webmaker:template')) {
              data[i].type = 'template';
            } else {
              data[i].type = data[i].contentType.replace(/application\/x\-/g, '');
            }
            data[i].avatar = generateGravatar(data[i].emailHash);
            data[i].updatedAt = moment(data[i].updatedAt).fromNow();
            data[i].createdAt = moment(data[i].createdAt).fromNow();
            data[i].remixurl = data[i].url + '/remix';
            data[i].hasBeenLiked = data[i].likes.some(hasUserLikedCheck);
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
        $(allItems)
          .find(".make-like-toggle")
          .off("click")
          .on("click", likeClickCallback);
        $mainGallery.append(allItems);
        masonry.appended(allItems);
        masonry.layout();
        onLoadUI();
      }

      // Export
      self.searchOptions = searchOptions;
      self.masonry = masonry;
      self.make = make;
      self.search = function (opts) {
        opts = opts || {};
        if (opts.sticky) {
          searchOptions.tagPrefix = options.stickyPrefix;
        } else if (options.stickyPrefix) {
          searchOptions.tagPrefix = [options.stickyPrefix, true]; // NOT stickyPrefix
        }

        make.find(searchOptions).then(resultsCallback);
      };

      // Set up masonry initially

      masonry.on('layoutComplete', onLoadUI);
      if (banner) {
        masonry.stamp(banner);
      }
      masonry.layout();

      localized.ready(function () {
        $(".make-like-toggle")
          .off("click")
          .on("click", likeClickCallback);
      });

      // Set up load more
      $loadMore.click(function () {
        searchOptions.page++;
        $loading.show();
        self.search({
          sticky: false
        });
      });

    };

    return Gallery;

  });
