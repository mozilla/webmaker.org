define(["jquery", "text!html/ui-fragments.html"], function ($, _fragments) {
  "use strict";

  var UI = {},
    $fragments = $(document.createElement("div")).html(_fragments);

  UI.select = function (select, fn) {

    $(".filter").removeClass("hide");

    var $el = $(".ui-select", $fragments).clone(true),
      $toggleBtn = $el.find(".icon"),
      $selectedEl = $el.find(".ui-selected"),
      $menuContainer = $el.find(".ui-select-menu"),
      $menu = $menuContainer.find("ul"),
      $li = $menu.find("li");

    var $select = $(select),
      $options = $("option", select),
      id = $select.attr("id");

    fn = fn || function () {};

    $options.each(function (i, option) {
      var val = $(option).val(),
        html = $(option).html(),
        $newLi = $li.clone();
      $newLi.attr("data-value", val);
      $newLi.html(html);
      if ($(option).attr("selected")) {
        $newLi.attr("data-selected", true);
        $selectedEl.html(html);
      }
      $newLi.click(function () {
        var $this = $(this);

        $menu.find("[data-selected]").removeAttr("data-selected");
        $(this).attr("data-selected", true);
        $selectedEl.text(html);
        $menuContainer.hide();
        fn(val);
        $select.val(val);

      });
      $menu.append($newLi);
    });

    $selectedEl.click(function (e) {
      $menuContainer.toggle();
    });
    $toggleBtn.click(function (e) {
      $menuContainer.toggle();
    });

    $el.attr("id", id);
    $select.removeAttr("id");

    $li.remove();
    $el.insertAfter($select);
    $select.hide();
  };

  UI.pagination = function (page, total, limit, callback) {
    var $pagination = $(".pagination"),
      $ul = $pagination.find("ul"),
      $_li = $("<li></li>"),
      $li,
      MAX_NUMS = 4,
      totalPages = total ? Math.ceil(total / limit) : 0,
      set = Math.floor((page - 1) / MAX_NUMS),
      startPage = set * MAX_NUMS + 1,
      endPage = Math.min((set * MAX_NUMS) + MAX_NUMS, totalPages);

    if (totalPages > 1) {
      $pagination.show();
    } else {
      $pagination.hide();
    }

    var $prevBtn = $_li.clone().html("<span class=\"icon-chevron-left\"></span>"),
      $nextBtn = $_li.clone().html("<span class=\"icon-chevron-right\"></span>");

    function pageSearch(page) {
      return function () {
        callback(page);
      };
    }

    $ul.empty();

    // Show previous?
    if (page > 1) {
      $ul.append($prevBtn);
      $prevBtn.click(pageSearch(page - 1));
    }
    // Iterate over all pages;
    for (var i = startPage; i <= endPage; i++) {
      $li = $_li.clone();
      $li.text(i);
      if (i === page) {
        $li.addClass("active");
      }
      $li.click(pageSearch(i));
      $ul.append($li);
    }
    if (totalPages > endPage) {
      $li = $_li.clone();
      $li.text(totalPages);
      $li.click(pageSearch(totalPages));
      $ul.append("<li class=\"ellipsis\"></li>");
      $ul.append($li);
    }
    if (page < totalPages) {
      $ul.append($nextBtn);
      $nextBtn.click(pageSearch(page + 1));
    }
  };

  return UI;

});
