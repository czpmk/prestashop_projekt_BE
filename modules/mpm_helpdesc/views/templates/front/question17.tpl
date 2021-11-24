
{extends file='page.tpl'}

{block name='left_column'}{/block}

{block name='page_content'}
    <div class="block products_block questions-block clearfix">
        <div class="questions-block-hidden hidden">
            <input type="hidden" name="id_shop" value="{$id_shop|escape:'htmlall':'UTF-8'}">
            <input type="hidden" name="id_lang" value="{$id_lang|escape:'htmlall':'UTF-8'}">
            <input type="hidden" name="key" value="{$key|escape:'htmlall':'UTF-8'}">
            <input type="hidden" name="isLogged" value="{$isLogged|escape:'htmlall':'UTF-8'}">
            <input type="hidden" name="basePath" value="{$basePath|escape:'htmlall':'UTF-8'}">
        </div>
        <div class="loader_block_helpdesc">
            <div class="loader fade-in">
                <div class="bounce1"></div>
                <div class="bounce2">
                </div><div class="bounce3">
                </div>
            </div>
        </div>
        <div class="questions-product-tab-content" style="display: none"></div>
    </div>
{/block}

{block name="right_column"}{/block}