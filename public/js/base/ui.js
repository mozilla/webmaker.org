define(['jquery', 'text!html/ui-fragments.html'], function ($, _fragments) {
  'use strict';

  var UI = {},
    $fragments = $(document.createElement('div')).html(_fragments);

  UI.select = function (select, fn) {
    $('.filter').removeClass('hide');

    var $el = $('.ui-select', $fragments).clone(true),
      $toggleBtn = $el.find('.icon'),
      $selectedEl = $el.find('.ui-selected'),
      $menuContainer = $el.find('.ui-select-menu'),
      $menu = $menuContainer.find('ul'),
      $li = $menu.find('li');

    var $select = $(select),
      $options = $('option', select),
      id = $select.attr('id');

    fn = fn || function () {};

    $options.each(function (i, option) {
      var val = $(option).val(),
        html = $(option).text(),
        title = $(option).attr('title'),
        $newLi = $li.clone();
      $newLi.attr('data-value', val);
      $newLi.html(html);
      $newLi.attr('title', title);
      if ($(option).attr('selected')) {
        $newLi.attr('data-selected', true);
        $selectedEl.html(html).attr('title', title);
      }
      $newLi.click(function () {
        $menu.find('[data-selected]').removeAttr('data-selected');
        $(this).attr('data-selected', true);
        $selectedEl.text(html);
        $menuContainer.hide();
        fn(val);
        $select.val(val);
      });
      $menu.append($newLi);
    });

    $selectedEl.click(function () {
      $menuContainer.toggle();
    });
    $toggleBtn.click(function () {
      $menuContainer.toggle();
    });

    $el.attr('id', id);
    $select.removeAttr('id');

    $li.remove();
    $el.insertAfter($select);
    $select.hide();
  };

  UI.pagination = function (page, total, limit, callback) {
    var $pagination = $('.pagination'),
      $ul = $pagination.find('ul'),
      $li = $('<li></li>'),
      $pageBtn,
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

    var $prevBtn = $li.clone().html('<span class="fa fa-chevron-left"></span>'),
      $nextBtn = $li.clone().html('<span class="fa fa-chevron-right"></span>');

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
      $pageBtn = $li.clone();
      $pageBtn.text(i);
      if (i === page) {
        $pageBtn.addClass('active');
      }
      $pageBtn.click(pageSearch(i));
      $ul.append($pageBtn);
    }
    if (totalPages > endPage) {
      $pageBtn = $li.clone();
      $pageBtn.text(totalPages);
      $pageBtn.click(pageSearch(totalPages));
      $ul.append('<li class=\'ellipsis\'></li>');
      $ul.append($pageBtn);
    }
    if (page < totalPages) {
      $ul.append($nextBtn);
      $nextBtn.click(pageSearch(page + 1));
    }
  };

  return UI;
});
