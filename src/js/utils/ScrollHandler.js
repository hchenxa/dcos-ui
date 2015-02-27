var $ = require("jquery");

function canvasSidebarOpen() {
  $("body").addClass("canvas-sidebar-open");
}

function canvasSidebarClose() {
  $("body").removeClass("canvas-sidebar-open");
}

/* Canvas Sidebar Toggle */
function canvasSidebarToggle() {
  if ($("body").hasClass("canvas-sidebar-open")) {
    canvasSidebarClose();
  } else {
    canvasSidebarOpen();
  }
}

/* Event Handler: Modal Resize */
function modalResize() {
  $(".modal").each(function () {
    if ($(this).hasClass("fade") && !$(this).hasClass("in")) {
      $(this).css({
        display: "block"
      });
    }

    var modalHeader = $(this).find(".modal-header");
    var modalFooter = $(this).find(".modal-footer");
    var modalContent = $(this).find(".modal-content");
    var modalContentInner = $(this).find(".modal-content-inner");

    var windowHeight = $(window).height();
    var modalHeaderHeight = modalHeader.outerHeight();
    var modalFooterHeight = modalFooter.outerHeight();
    var modalContentHeight = modalContent.height();
    var modalContentPadding = modalContent.outerHeight() - modalContentHeight;
    var modalContentInnerHeight = modalContentInner.outerHeight();
    var modalTotalHeight =
      modalHeaderHeight +
      modalContentPadding +
      modalContentInnerHeight +
      modalFooterHeight;
    var modalMargins = 15;

    if ((modalTotalHeight + (2 * modalMargins)) > windowHeight) {
      modalContent.css({
        "height":
          windowHeight -
          modalHeaderHeight -
          modalContentPadding -
          modalFooterHeight -
          (2 * modalMargins)
      });
    } else {
      modalContent.css({
        "height": modalContentInnerHeight
      });
    }
    $(this).css({
      "margin-top": -1 * ($(this).outerHeight() / 2)
    });

    // Remove display:block for resizing calculations to avoid element covering screen
    if ($(this).hasClass("fade") && !$(this).hasClass("in")) {
      $(this).css({
        display: "none"
      });
    }
  });
}

/* Event Handler: Window Resize */
function windowResize() {
  var responsiveViewport = $(window).width();

  if (responsiveViewport >= 992) {
    canvasSidebarClose();
  }

  /* Resize canvas to fit height of viewport */
  $("#sidebar").height($(window).height());

  /* Resize sidebar content height */
  var sidebar = $("#sidebar");
  var sidebarHeader = $("#sidebar-header");
  var sidebarContent = $("#sidebar-content");
  var sidebarFooter = $("#sidebar-footer");

  var sidebarContentHeight =
    sidebar.outerHeight() -
    sidebarHeader.outerHeight() -
    sidebarFooter.outerHeight();

  if (sidebarContentHeight < 0) {
    sidebarContentHeight = 0;
  }

  sidebarContent.css({
   "height": sidebarContentHeight
  });

  /* Resize page content height */
  var page = $("#sidebar");
  var pageHeader = $("#page-header");
  var pageContent = $("#page-content");

  var pageContentHeight = page.outerHeight() - pageHeader.outerHeight();

  if (pageContentHeight < 0) {
    pageContentHeight = 0;
  }

  pageContent.css({
    "height": pageContentHeight
  });

  /* Resize Modal */
  modalResize();
}

/* Initialize */
function init() {

  /* Define window resize event listener */
  $(window).resize(function () {
    windowResize();
  });

  windowResize();

  /* Allow modal backdrop click to trigger close */
  $(document.body).on("click", "> .modal-backdrop", function () {
    $(".modal").modal("hide");
  });

  /* Initialize Header Canvas Sidebar Toggle */
  $("#page-header .page-header-sidebar-toggle").click(function (e) {
    e.preventDefault();
    canvasSidebarToggle();
  });
}

/* DOM Event Listeners */
$(window).on("load", function () {
  init();
});