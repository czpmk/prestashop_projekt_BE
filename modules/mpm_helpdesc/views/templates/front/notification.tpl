<div class="notification_block notification_block_{$key|escape:'htmlall':'UTF-8'}">
    <div class="notification_info">
        <div class="notification_icon"><img class="review_icon" src="{$domain}modules/mpm_helpdesc/views/img/reviews_page.svg"></div>
        <div class="notification_title">{$title|escape:'htmlall':'UTF-8'}</div>
        <div class="notification_descr">{$descr|escape:'htmlall':'UTF-8'|unescape}</div>
    </div>
    {if $key == 'reviews'}
        <div class="notification_reviews">
            <input type="hidden" name="id_site" value="{if isset($data[0]) && $data[0]}{$data[0]|escape:'htmlall':'UTF-8'}{/if}">
            <input type="hidden" name="id_shop" value="{if isset($data[1]) && $data[1]}{$data[1]|escape:'htmlall':'UTF-8'}{/if}">
            <input type="hidden" name="id_lang" value="{if isset($data[2]) && $data[2]}{$data[2]|escape:'htmlall':'UTF-8'}{/if}">
            <input type="hidden" name="id_order" value="{if isset($data[3]) && $data[3]}{$data[3]|escape:'htmlall':'UTF-8'}{/if}">
            <input type="hidden" name="id_product" value="{if isset($data[4]) && $data[4]}{$data[4]|escape:'htmlall':'UTF-8'}{/if}">
            <input type="hidden" name="basePath" value="{$basePath|escape:'htmlall':'UTF-8'}">
            <div class="getFormReviews">
                <div class="loader_block_helpdesc">
                    <div class="loader fade-in">
                        <div class="bounce1"></div>
                        <div class="bounce2">
                        </div><div class="bounce3">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    {/if}
</div>