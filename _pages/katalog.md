---
layout: default
title: Katalog
permalink: /katalog
---

<section class="katalog-page">
    <div class="section-title">
        <h2><span>Katalog Qurban</span></h2>
    </div>
    <div class="katalog-masonry">
        {% for post in site.posts %}
            {% if post.categories contains 'katalog' %}
                {% include katalog-masonry-card.html %}
            {% endif %}
        {% endfor %}
    </div>
</section>

<script>
document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.katalog-masonry-card__image[data-images]').forEach(function (img) {
        var images = img.dataset.images.split('|').filter(Boolean);
        if (images.length > 1) {
            img.src = images[Math.floor(Math.random() * images.length)];
        }
    });
});
</script>
