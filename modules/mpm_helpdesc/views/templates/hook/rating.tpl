{if !$rating_type || $rating_type == mpm_helpdesc::CATEGORY || $rating_type == mpm_helpdesc::STARS}
  <div
    class="mpm_product_stars_block{if $rating_type == mpm_helpdesc::CATEGORY} {$ps_version}{mpm_helpdesc::CATEGORY}{/if}">
    <fieldset>
        {if !isset($review['total_rating']) || !$review['total_rating'] }
          <i class="mpr-star"></i>
          <i class="mpr-star"></i>
          <i class="mpr-star"></i>
          <i class="mpr-star"></i>
          <i class="mpr-star"></i>
        {else}
            {if $review['total_rating'] == 0.5 }
              <i class="mpr-star-half"></i>
              <i class="mpr-star"></i>
              <i class="mpr-star"></i>
              <i class="mpr-star"></i>
              <i class="mpr-star"></i>
            {/if}
            {if $review['total_rating'] == 1 }
              <i class="mpr-s-star"></i>
              <i class="mpr-star"></i>
              <i class="mpr-star"></i>
              <i class="mpr-star"></i>
              <i class="mpr-star"></i>
            {/if}
            {if $review['total_rating'] == 1.5 }
              <i class="mpr-s-star"></i>
              <i class="mpr-star-half"></i>
              <i class="mpr-star"></i>
              <i class="mpr-star"></i>
              <i class="mpr-star"></i>
            {/if}
            {if $review['total_rating'] == 2 }
              <i class="mpr-s-star"></i>
              <i class="mpr-s-star"></i>
              <i class="mpr-star"></i>
              <i class="mpr-star"></i>
              <i class="mpr-star"></i>
            {/if}
            {if $review['total_rating'] == 2.5 }
              <i class="mpr-s-star"></i>
              <i class="mpr-s-star"></i>
              <i class="mpr-star-half"></i>
              <i class="mpr-star"></i>
              <i class="mpr-star"></i>
            {/if}
            {if $review['total_rating'] == 3 }
              <i class="mpr-s-star"></i>
              <i class="mpr-s-star"></i>
              <i class="mpr-s-star"></i>
              <i class="mpr-star"></i>
              <i class="mpr-star"></i>
            {/if}
            {if $review['total_rating'] == 3.5 }
              <i class="mpr-s-star"></i>
              <i class="mpr-s-star"></i>
              <i class="mpr-s-star"></i>
              <i class="mpr-star-half"></i>
              <i class="mpr-star"></i>
            {/if}
            {if $review['total_rating'] == 4 }
              <i class="mpr-s-star"></i>
              <i class="mpr-s-star"></i>
              <i class="mpr-s-star"></i>
              <i class="mpr-s-star"></i>
              <i class="mpr-star"></i>
            {/if}
            {if $review['total_rating'] == 4.5 }
              <i class="mpr-s-star"></i>
              <i class="mpr-s-star"></i>
              <i class="mpr-s-star"></i>
              <i class="mpr-s-star"></i>
              <i class="mpr-star-half"></i>
            {/if}
            {if $review['total_rating'] == 5 }
              <i class="mpr-s-star"></i>
              <i class="mpr-s-star"></i>
              <i class="mpr-s-star"></i>
              <i class="mpr-s-star"></i>
              <i class="mpr-s-star"></i>
            {/if}
        {/if}
    </fieldset>
      {if !$rating_type}
        <a class="count_reviews" href="{$product_link}#mpm_reviews_tab">
            {if isset($review['reviews_count']) && $review['reviews_count']}
                {$review['reviews_count']}
            {else}
              0
            {/if}
            {l s='reviews' mod='mpm_helpdesc'}
        </a>
      {/if}
      {if $rating_type == mpm_helpdesc::CATEGORY}
          <a href="{$product_link}#reviews" class="count_reviews">
            {if isset($review['reviews_count']) && $review['reviews_count']}
                {$review['reviews_count']}
            {else}
                0
            {/if}
              {l s='reviews' mod='mpm_helpdesc'}
        </a>
      {/if}
  </div>
{/if}

{if $rating_type == mpm_helpdesc::REVIEWS_COUNT || $rating_type == mpm_helpdesc::RATING_COUNT || $rating_type == mpm_helpdesc::TOTAL_RATING}
    <div class="mpm_{$rating_type}">
      {if $review }
          {$review[$rating_type]}
      {else}
          0
      {/if}
    </div>
{/if}

{if $rating_type == mpm_helpdesc::WRITE_REVIEW }
    <div class="mpm_write_review">
        {l s='Leave review' mod='mpm_helpdesc'}
    </div>
{/if}

{if $rating_type == mpm_helpdesc::ASK_QUESTION }
    <div class="mpm_ask_question">
        {l s='Ask a question' mod='mpm_helpdesc'}
    </div>
{/if}