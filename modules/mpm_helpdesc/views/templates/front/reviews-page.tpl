<div class="dedicated_reviews_page {if isset($page) && $page}reviews-block-content-cached{/if}">

    <div class="dedicated-block-hidden reviews-block-hidden hidden">
        <input type="hidden" name="id_shop" value="{$id_shop|escape:'htmlall':'UTF-8' nofilter}">
        <input type="hidden" name="id_lang" value="{$id_lang|escape:'htmlall':'UTF-8' nofilter}">
        <input type="hidden" name="isLogged" value="{$isLogged|escape:'htmlall':'UTF-8' nofilter}">
        <input type="hidden" name="basePath" value="{$basePath|escape:'htmlall':'UTF-8' nofilter}">
        <input type="hidden" name="type_reviews" value="{$type|escape:'htmlall':'UTF-8' nofilter}">
        <input type="hidden" name="page_number" value="{$p|escape:'htmlall':'UTF-8' nofilter}">
    </div>

    <div class="loader_block_helpdesc">
        <div class="loader fade-in">
            <div class="bounce1"></div>
            <div class="bounce2">
            </div><div class="bounce3">
            </div>
        </div>
    </div>

    <div class="dedicated_reviews_page_content">
        {if isset($page) && $page}
            {$page|escape:'htmlall':'UTF-8'|unescape nofilter}
        {else}
            <div class="empty_dedicated_reviews_page"></div>
        {/if}
    </div>

</div>










