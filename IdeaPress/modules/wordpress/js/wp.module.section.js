﻿/*
IdeaPress Wordpress JSON API module
Author: IdeaNotion
*/
(function () {
    "use strict";

    var item;
    var fetching = false;
    
    function hideLoader() {
        if (fetching === false) {
            var loader = document.querySelector("progress");
            ideaPress.toggleElement(loader, "hide");
        }
    }

    function showLoader() {
        var loader = document.querySelector("progress");
        ideaPress.toggleElement(loader, "show");
    }

    function getOlderPosts() {
        if (document.querySelector('.wp-list')) {
            var listview = document.querySelector('.wp-list').winControl;

            if ('itemsLoaded' == listview.loadingState && (listview.indexOfLastVisible + 1) >= item.list.length && fetching === false) {
                showLoader();
                fetching = item.fetch((item.list.length / item.defaultCount)).then(function () {
                    fetching = false;
                    hideLoader();
                }, function () {
                    fetching = false;
                    hideLoader();
                }, function () {
                });
            } else if ('complete' == listview.loadingState) {
                item.scrollPosition = listview.scrollPosition;
            }
        }
    }

    function scrollToPosition() {
        var listview = document.querySelector(".wp-list").winControl;

        if ('complete' == listview.loadingState) {

            listview.removeEventListener('loadingstatechanged', scrollToPosition);
        }
    }


    WinJS.UI.Pages.define("/modules/wordpress/pages/wp.module.section.html", {
        ready: function (element, options) {
            item = options.category;
            
            WinJS.UI.Animation.enterPage(document.querySelector('header'), { top: '0px', left: '200px' });   

            document.querySelector('.pagetitle').innerText = item.title;

            this.updateLayout(element, Windows.UI.ViewManagement.ApplicationView.value);

            var wc = document.querySelector('.wp-list').winControl;
            wc.addEventListener('loadingstatechanged', hideLoader);
            
            wc.addEventListener("mousewheel", function (eventObject) {
                var delta = -Math.round(eventObject.wheelDelta);
                wc.scrollPosition = wc.scrollPosition + delta;
                return true;
            });
            
            // scroll background
            wc.addEventListener("mousewheel", ideaPress.scrollBackground);
        },

        // This function updates the page layout in response to viewState changes.
        updateLayout: function (element, viewState) {
            var listView = element.querySelector('.wp-list').winControl;
            var listViewLayout;

            if (viewState === Windows.UI.ViewManagement.ApplicationViewState.snapped) {
                listViewLayout = new WinJS.UI.ListLayout();
            } else {
                listViewLayout = new WinJS.UI.GridLayout();
            }

            WinJS.UI.setOptions(listView, {
                itemDataSource: item.list.dataSource,
                itemTemplate: element.querySelector('.wp-post-template'),
                selectionMode: 'none',
                swipeBehavior: 'none',
                layout: listViewLayout,
                item: self
            });
            listView.oniteminvoked = function (e) { item.showPost(e); };
            
            if (item.scrollPosition > 0) {
                //hideLoader();
                listView.addEventListener('loadingstatechanged', scrollToPosition);
            }

            listView.addEventListener('loadingstatechanged', getOlderPosts);
            
        },
    });
})();
