---
layout: default
title: Tulisan
permalink: /tulisan
---

<section class="recent-posts">
    <div class="section-title">
        <h2><span>Tulisan</span></h2>
    </div>
    <div class="row list-recent">
        {% for post in site.posts %}
            {% if post.categories contains 'cerita' or post.categories contains 'pojok-ilmu' %}
                {% include post-box.html %}
            {% endif %}
        {% endfor %}
    </div>
</section>
