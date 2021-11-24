<div class="block products_block reviews-block clearfix reviews-block-content {if isset($page_content) && $page_content}dedicated_reviews_page_cached{/if}">
    {*<link rel="stylesheet" href="{$css_url|escape:'htmlall':'UTF-8' nofilter}" type="text/css" media="all">*}
    <div class="reviews-block-hidden hidden">
        <input type="hidden" name="id_shop" value="{$id_shop|escape:'htmlall':'UTF-8' nofilter}">
        <input type="hidden" name="id_lang" value="{$id_lang|escape:'htmlall':'UTF-8' nofilter}">
        <input type="hidden" name="id_product" value="{$id_product|escape:'htmlall':'UTF-8' nofilter}">
        <input type="hidden" name="isLogged" value="{$isLogged|escape:'htmlall':'UTF-8' nofilter}">
        <input type="hidden" name="basePath" value="{$basePath|escape:'htmlall':'UTF-8' nofilter}">
        <input type="hidden" name="bought" value="{$bought|escape:'htmlall':'UTF-8' nofilter}">
    </div>
    <div class="loader_block_helpdesc">
        <div class="loader fade-in">
            <div class="bounce1"></div>
            <div class="bounce2">
            </div><div class="bounce3">
            </div>
        </div>
    </div>
    <div class="reviews-product-tab-content" id="main-reviews-product">
        {if isset($page_content) && $page_content}
            {$page_content|escape:'htmlall':'UTF-8'|unescape nofilter}
        {else}
            <div class="error_reviews_page"></div>
        {/if}
    </div>
</div>