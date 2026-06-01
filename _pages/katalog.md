---
layout: default
title: Katalog Qurban & Aqiqah
description: "Jelajahi katalog kambing qurban dan aqiqah Al-Minnah Farm. Temukan pilihan kambing berkualitas dengan informasi lengkap berat, tinggi, dan harga yang transparan."
permalink: /katalog
---

{% assign posts_1448 = site.posts | where_exp: "post", "post.categories contains 'katalog' and post.tahun_hijri == 1448" %}
{% assign posts_1447 = site.posts | where_exp: "post", "post.categories contains 'katalog' and post.tahun_hijri == 1447" %}
{% assign kelas_1448 = posts_1448 | map: "kelas" | uniq | sort %}
{% assign kelas_1447 = posts_1447 | map: "kelas" | uniq | sort %}

<section class="katalog-page">

    <!-- 1448 H -->
    <div class="katalog-page-header">
        <h2 class="katalog-page-title"><span>Katalog Qurban 1448 H</span></h2>
        <label class="katalog-toggle">
            <input type="checkbox" id="hideSoldToggle">
            <span class="katalog-toggle__track"></span>
            <span class="katalog-toggle__label">Sembunyikan Terjual</span>
        </label>
    </div>

    <div class="katalog-filter-row">
        <div class="katalog-filter-tabs" id="tabs-1448">
            <button class="katalog-filter-tab active" data-filter="all">Semua</button>
            {% for kelas in kelas_1448 %}{% if kelas != "" and kelas %}
            <button class="katalog-filter-tab" data-filter="{{ kelas }}">{{ kelas }}</button>
            {% endif %}{% endfor %}
        </div>
        <span class="katalog-filter-info" id="katalogFilterInfo"></span>
    </div>

    <div class="katalog-masonry" id="masonry-1448">
        {% for post in posts_1448 %}
            {% include katalog-masonry-card.html use_thumbnail=true %}
        {% endfor %}
    </div>

    <!-- 1447 H -->
    <div class="katalog-year-section" id="section-1447">
        <div class="katalog-page-header katalog-page-header--secondary">
            <h2 class="katalog-page-title katalog-page-title--secondary"><span>Katalog Qurban 1447 H</span></h2>
        </div>

        <div class="katalog-filter-row">
            <div class="katalog-filter-tabs" id="tabs-1447">
                <button class="katalog-filter-tab active" data-filter="all">Semua</button>
                {% for kelas in kelas_1447 %}{% if kelas != "" and kelas %}
                <button class="katalog-filter-tab" data-filter="{{ kelas }}">{{ kelas }}</button>
                {% endif %}{% endfor %}
            </div>
        </div>

        <div class="katalog-masonry" id="masonry-1447">
            {% for post in posts_1447 %}
                {% include katalog-masonry-card.html use_thumbnail=true %}
            {% endfor %}
        </div>
    </div>

</section>

<script>
document.addEventListener('DOMContentLoaded', function () {
    var infoEl = document.getElementById('katalogFilterInfo');
    var masonry1448 = document.getElementById('masonry-1448');
    var masonry1447 = document.getElementById('masonry-1447');
    var section1447 = document.getElementById('section-1447');
    var hideSoldToggle = document.getElementById('hideSoldToggle');

    var items1448 = Array.from(masonry1448.querySelectorAll('.katalog-masonry-item'));
    var items1447 = Array.from(masonry1447.querySelectorAll('.katalog-masonry-item'));

    function parseBerat(str) {
        if (!str) return NaN;
        return parseFloat(str.replace(',', '.').replace(/[^0-9.]/g, ''));
    }

    function parseHarga(str) {
        if (!str) return NaN;
        return parseInt(str.replace(/[^0-9]/g, ''), 10);
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
        infoEl.innerHTML = '<span class="fi-label">Menampilkan </span><span class="fi-value">' + visibleItems.length + ' kambing</span>'
            + '<span class="fi-label"> · Berat </span><span class="fi-value">' + beratMin.toString().replace('.', ',') + ' kg–' + beratMax.toString().replace('.', ',') + ' kg</span>'
            + '<span class="fi-label"> · Harga </span><span class="fi-value">Rp' + hargaMin.toLocaleString('id-ID') + '–Rp' + hargaMax.toLocaleString('id-ID') + '</span>';
    }

    function makeFilter(tabs, items, masonry, onFilter) {
        function apply(filter) {
            items.forEach(function (item) { item.remove(); });
            var visible = [];
            items.forEach(function (item) {
                if (filter === 'all' || item.dataset.kelas === filter) {
                    masonry.appendChild(item);
                    visible.push(item);
                }
            });
            if (onFilter) onFilter(visible);
            return visible;
        }

        tabs.forEach(function (tab) {
            tab.addEventListener('click', function () {
                tabs.forEach(function (t) { t.classList.remove('active'); });
                tab.classList.add('active');
                apply(tab.dataset.filter);
            });
        });

        return apply;
    }

    var tabs1448 = Array.from(document.querySelectorAll('#tabs-1448 .katalog-filter-tab'));
    var tabs1447 = Array.from(document.querySelectorAll('#tabs-1447 .katalog-filter-tab'));

    var apply1448 = makeFilter(tabs1448, items1448, masonry1448, updateInfo);
    var apply1447 = makeFilter(tabs1447, items1447, masonry1447, null);

    hideSoldToggle.addEventListener('change', function () {
        section1447.style.display = hideSoldToggle.checked ? 'none' : '';
    });

    // Init
    apply1448('all');
    apply1447('all');
});
</script>
