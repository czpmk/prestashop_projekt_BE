<div class="welcome_page">
      <div class="introduction_block">
          <div class="introduction_content">
              <div class="introduction_row">
                  <div class="introduction_title">{l s='Welcome to MyPrestaReviews!' mod='mpm_helpdesc'}</div>
                  <div class="introduction_descr">
                      {l s='MyPrestaReviews will help you build a powerful store with the feedback system with your buyers. You can completely customize the design for yourself and manage the settings you need.' mod='mpm_helpdesc'}
                  </div>
                  <div class="introduction_button">
                      <a target="_blank" class="lets_start" href="https://myprestareviews.com/signin?signup=1&domain={$domain}">{l s='login to Cabinet' mod='mpm_helpdesc'}<i class="mpr-chevron-right"></i></a>
                  </div>
              </div>
          </div>
      </div>
    <div class="welcome_page_content">
        <div class="welcome_page_left_column">
            <div class="welcome_page_item_block">
                <div class="welcome_page_header"><i class="mpr-server-connection"></i>{l s='Secure Key & Connect' mod='mpm_helpdesc'}</div>
                <div class="content_base_block">
                    <div class="content_base_block_label">{l s='Your Secure Key:' mod='mpm_helpdesc'}</div>
                    <div class="content_base_block_descr">
                        <p>{l s='Paste the generated secure key that you received after adding your site in control panel here - ' mod='mpm_helpdesc'}<a  target="_blank"  href="https://myprestareviews.com/dashboard/mysites/">{l s='Manage Site' mod='mpm_helpdesc'}</a>.</p>
                        <p>{l s='If you have any questions or problems-visit ' mod='mpm_helpdesc'}<a target="_blank"  href="https://myprestareviews.com/dashboard/support-center/">{l s='Support Page' mod='mpm_helpdesc'}</a>.</p>
                    </div>
                    <div class="secure_key_row">
                        <div class="secure_key_info secure_key_content">
                            <div class="secure_key_input"> <input type="text" class="secure_key" name="secure_key" value="{$secure_key|escape:'htmlall':'UTF-8'}"></div>
                            <div class="save_secure_key_button "><a type="button" class="save_secure_key">{l s='Save & Connect' mod='mpm_helpdesc'}</a><input type="hidden" name="basePath" value="{$basePath|escape:'htmlall':'UTF-8'}"></div>
                        </div>
                        <a target="_blank" class="secure_key_help" href="https://www.youtube.com/watch?v=hAwH4RssdLs"><i class="mpr-help-circle"></i>{l s='Need help? Watch Guide.' mod='mpm_helpdesc'}</a>
                    </div>
                </div>
            </div>
            <div class="welcome_page_item_block">
                <div class="welcome_page_header"><i class="mpr-web"></i>{l s='Dedicated Reviews Page' mod='mpm_helpdesc'}</div>
                <div class="content_base_block">
                    <div class="content_base_block_label">{l s='Your Dedicated Reviews Page URL:' mod='mpm_helpdesc'}</div>
                    <div class="content_base_block_descr">
                        <p>{l s='You can change page URL here: ' mod='mpm_helpdesc'}<a  target="_blank"  href="{$meta_page_link|escape:'htmlall':'UTF-8'}">{l s='SEO & URLs' mod='mpm_helpdesc'}</a>.</p>
                    </div>
                    <div class="dedicated_reviews_page">
                        <a onclick="" target="_blank" class="dedicated_reviews_page_link" href="{$dedicated_reviews_page_link|escape:'htmlall':'UTF-8'}">{$dedicated_reviews_page_link|escape:'htmlall':'UTF-8'}</a>
                    </div>
                </div>
            </div>
            <div class="welcome_page_item_block">
                <div class="welcome_page_header"><i class="mpr-info-circle"></i>{l s='Module Requirements' mod='mpm_helpdesc'}</div>
                <div class="content_base_block">
                    <div class="content_base_block_label">{l s='Minimum Requirements:' mod='mpm_helpdesc'}</div>
                    <div class="content_base_block_descr">
                       <p><i class="mpr-info-circle"></i>{l s='If you are using a free or very cheap shared hosting then your server may not support some of the required features. Please check all required values!' mod='mpm_helpdesc'}</p>
                    </div>

                    <div class="require_list">
                        <ul>
                            <li>
                                <span>{l s='Module Folder Permissions' mod='mpm_helpdesc'}</span>
                                <div class="permission_status  {if $folder_perms == 755}permission_status_ok{else}permission_status_not_ok{/if}"><i class="mpr-info-circle"></i>{$folder_perms|escape:'htmlall':'UTF-8'}</div>
                                {if $folder_perms !== 755}<a target="_blank" href="https://myprestareviews.com/faqs/general-questions/how-to-change-module-file-permissions/"><i class="mpr-open_in_new"></i>{l s='Read how to change permissions' mod='mpm_helpdesc'}</a>{/if}
                            </li>
                            <li>
                                <span>{l s='Module File Permissions' mod='mpm_helpdesc'}</span>
                                <div class="permission_status  {if $file_perms == 644}permission_status_ok{else}permission_status_not_ok{/if}"><i class="mpr-info-circle"></i>{$file_perms|escape:'htmlall':'UTF-8'}</div>
                                {if $file_perms !== 644}<a  target="_blank" href="https://myprestareviews.com/faqs/general-questions/how-to-change-module-file-permissions/"><i class="mpr-open_in_new"></i>{l s='Read how to change permissions' mod='mpm_helpdesc'}</a>{/if}
                            </li>
                            <li class="before_line">
                                <span>{l s='max_execution_time' mod='mpm_helpdesc'}</span>
                                <div class="permission_status"><i class="mpr-info-circle"></i>{$max_execution_time|escape:'htmlall':'UTF-8'}</div>
                            </li>
                            <li class="before_line">
                                <span>{l s='memory_limit' mod='mpm_helpdesc'}</span>
                                <div class="permission_status"><i class="mpr-info-circle"></i>{$memory_limit|escape:'htmlall':'UTF-8'}</div>
                            </li>
                            <li>
                                <span>{l s='PHP cURL extension' mod='mpm_helpdesc'}</span>
                                <div class="permission_status {if $curl}permission_status_ok{else}permission_status_not_ok{/if}"><i class="mpr-info-circle"></i>{if $curl}{l s='on' mod='mpm_helpdesc'}{else}{l s='off' mod='mpm_helpdesc'}{/if}</div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
        <div class="welcome_page_right_column">
            <div class="welcome_page_item_block">
                <div class="welcome_page_header"><i class="mpr-comment-question"></i>{l s='Quick Start Guide' mod='mpm_helpdesc'}</div>
                <div class="content_right_block">
                    <ul>
                       <li><a target="_blank" href="https://myprestareviews.com/help-center/installing-module/"><img src="{$module_path|escape:'htmlall':'UTF-8'}views/img/installing.png">{l s='Module Installation' mod='mpm_helpdesc'}<i class="mpr-navigation"></i></a></li>
                       <li><a target="_blank" href="https://myprestareviews.com/help-center/site-management/"><img src="{$module_path|escape:'htmlall':'UTF-8'}views/img/management.png">{l s='Website Management' mod='mpm_helpdesc'}<i class="mpr-navigation"></i></a></li>
                       <li><a target="_blank" href="https://myprestareviews.com/help-center/account-overview/"><img src="{$module_path|escape:'htmlall':'UTF-8'}views/img/overview.png">{l s='Account Overview' mod='mpm_helpdesc'}<i class="mpr-navigation"></i></a></li>
                       <li><a target="_blank" href="https://myprestareviews.com/help-center/"><img src="{$module_path|escape:'htmlall':'UTF-8'}views/img/help.png">{l s='Help Center' mod='mpm_helpdesc'}<i class="mpr-navigation"></i></a></li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</div>