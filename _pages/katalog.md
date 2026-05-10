---
layout: default
title: Katalog Qurban & Aqiqah
description: "Jelajahi katalog kambing qurban dan aqiqah Al-Minnah Farm. Temukan pilihan kambing berkualitas dengan informasi lengkap berat, tinggi, dan harga yang transparan."
permalink: /katalog
---

<section class="katalog-page">
    <div class="katalog-page-header">
        <h2 class="katalog-page-title"><span>Katalog Qurban</span></h2>
        <label class="katalog-toggle">
            <input type="checkbox" id="hideSoldToggle">
            <span class="katalog-toggle__track"></span>
            <span class="katalog-toggle__label">Sembunyikan Terjual</span>
        </label>
    </div>

    <div class="katalog-filter-row">
        <div class="katalog-filter-tabs">
            <button class="katalog-filter-tab active" data-filter="all">Semua</button>
            <button class="katalog-filter-tab" data-filter="Al-Barakah">Al-Barakah</button>
            <button class="katalog-filter-tab" data-filter="Al-Mumtaz">Al-Mumtaz</button>
            <button class="katalog-filter-tab" data-filter="Al-Akhyar">Al-Akhyar</button>
        </div>
        <span class="katalog-filter-info" id="katalogFilterInfo"></span>
    </div>

    <div class="katalog-masonry">
        {% for post in site.posts %}
            {% if post.categories contains 'katalog' %}
                {% include katalog-masonry-card.html use_thumbnail=true %}
            {% endif %}
        {% endfor %}
    </div>
</section>

<script>
document.addEventListener('DOMContentLoaded', function () {
    // Randomise images
    document.querySelectorAll('.katalog-masonry-card__image[data-images]').forEach(function (img) {
        var images = img.dataset.images.split('|').filter(Boolean);
        if (images.length > 1) {
            img.src = images[Math.floor(Math.random() * images.length)];
        }
    });


    // Filter tabs
    var tabs = document.querySelectorAll('.katalog-filter-tab');
    var items = document.querySelectorAll('.katalog-masonry-item');
    var infoEl = document.getElementById('katalogFilterInfo');

    function parseBerat(str) {
        if (!str) return NaN;
        return parseFloat(str.replace(',', '.').replace(/[^0-9.]/g, ''));
    }

    function parseHarga(str) {
        if (!str) return NaN;
        return parseInt(str.replace(/[^0-9]/g, ''), 10);
    }

    function formatHarga(num) {
        return 'Rp' + num.toLocaleString('id-ID');
    }

    function formatBerat(num) {
        return num.toString().replace('.', ',') + ' kg';
    }

    function updateInfo(visibleItems) {
        var berats = [], hargas = [];
        visibleItems.forEach(function (item) {
            var b = parseBerat(item.dataset.berat);
            var h = parseHarga(item.dataset.harga);
            if (!isNaN(b)) berats.push(b);
            if (!isNaN(h)) hargas.push(h);
        });
        if (!berats.length) { infoEl.innerHTML = ''; return; }
        var beratMin = Math.min.apply(null, berats);
        var beratMax = Math.max.apply(null, berats);
        var hargaMin = Math.min.apply(null, hargas);
        var hargaMax = Math.max.apply(null, hargas);
        var s = '<span class="fi-label">Menampilkan </span><span class="fi-value">' + visibleItems.length + ' kambing</span>'
            + '<span class="fi-label"> · Berat </span><span class="fi-value">' + formatBerat(beratMin) + '–' + formatBerat(beratMax) + '</span>'
            + '<span class="fi-label"> · Harga </span><span class="fi-value">' + formatHarga(hargaMin) + '–' + formatHarga(hargaMax) + '</span>';
        infoEl.innerHTML = s;
    }

    var allItems = Array.from(items);
    var masonry = document.querySelector('.katalog-masonry');
    var hideSoldToggle = document.getElementById('hideSoldToggle');

    function activeFilter() {
        var activeTab = document.querySelector('.katalog-filter-tab.active');
        return activeTab ? activeTab.dataset.filter : 'all';
    }

    function applyFilter(filter) {
        var hideSold = hideSoldToggle.checked;
        allItems.forEach(function (item) { item.remove(); });
        var visible = [];
        allItems.forEach(function (item) {
            var matchesKelas = filter === 'all' || item.dataset.kelas === filter;
            var matchesAvail = !hideSold || item.dataset.available === 'true';
            if (matchesKelas && matchesAvail) {
                masonry.appendChild(item);
                visible.push(item);
            }
        });
        updateInfo(visible);
    }

    tabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
            tabs.forEach(function (t) { t.classList.remove('active'); });
            tab.classList.add('active');
            var filter = tab.dataset.filter;
            history.replaceState(null, '', filter === 'all' ? window.location.pathname : '#' + filter);
            applyFilter(filter);
        });
    });

    hideSoldToggle.addEventListener('change', function () {
        applyFilter(activeFilter());
    });

    // Init from URL hash
    var initialFilter = window.location.hash.replace('#', '') || 'all';
    var initialTab = document.querySelector('.katalog-filter-tab[data-filter="' + initialFilter + '"]');
    if (initialTab) {
        tabs.forEach(function (t) { t.classList.remove('active'); });
        initialTab.classList.add('active');
    }
    applyFilter(initialFilter);
});
</script>
