<?php

if (!defined('_PS_VERSION_')) {
    exit;
}


class mpm_helpdesc extends Module
{

  private $_shopId;
  private $_langId;
  const STARS = 'stars';
  const REVIEWS_COUNT = 'reviews_count';
  const RATING_COUNT = 'rating_count';
  const TOTAL_RATING = 'total_rating';
  const CATEGORY = 'category';
  const WRITE_REVIEW = 'write_review';
  const ASK_QUESTION = 'ask_question';
  const PRODUCT_RATING = 'product_rating';

  public function __construct()
  {
    $this->_shopId = Context::getContext()->shop->id;
    $this->_langId = Context::getContext()->language->id;
    $this->name = 'mpm_helpdesc';
    $this->tab = 'front_office_features';
    $this->version = '2.0.0';
    $this->author = 'MyPrestaModules';
    $this->need_instance = 0;
    $this->bootstrap = true;
    $this->controllers = array(
      'DisplayDedicatedReviews'
    );

    parent::__construct();

    $this->displayName = $this->l('MyPrestaReviews - Product Reviews + Tickets + Reminders + Rich Snippets');
    $this->description = $this->l('Product Reviews + Tickets + Reminders + Rich Snippets');
    $this->confirmUninstall = $this->l('Are you sure you want to uninstall?');

    if( _PS_BASE_URL_ == 'http://gomakoil' ){
      if( !defined('MYPRESTAREVIEWS_URL') ){
        define('MYPRESTAREVIEWS_URL', 'http://myprestareviews.yura/');
      }
    } else{
      if( !defined('MYPRESTAREVIEWS_URL') ){
        define('MYPRESTAREVIEWS_URL', 'https://myprestareviews.com/');
      }
    }
  }

  public function install()
  {
    $hooksForRegistration = $this->getHooksForRegistration(_PS_VERSION_);
    if( !parent::install() || !$this->registerHook($hooksForRegistration) ){
      return false;
    }

    if( !$this->installDb() ){
      return false;
    }

    return true;
  }

  public function uninstall()
  {

    if( !parent::uninstall() ){
      return false;
    }

    if( !$this->uninstallDb() ){
      return false;
    }

    return true;
  }

  /**
   * @param $ps_version
   * @return array
   */
  private function getHooksForRegistration( $ps_version )
  {
    $hooks = array(
      'displayHeader',
      'moduleRoutes',
      'displayRatingProduct',
      'displayDedicatedReviewsPage'
    );

    if( $ps_version < 1.7 ){
      $hooksSpecificForPS16 = array(
        'displayProductTab',
        'displayProductTabContent'
      );
      $hooks = array_merge($hooks, $hooksSpecificForPS16);
    } else{
      $hooksSpecificForPS17 = array( 'displayProductExtraContent' );
      $hooks = array_merge($hooks, $hooksSpecificForPS17);
    }

    return $hooks;
  }


  public function uninstallDb()
  {

    $sql = 'DROP TABLE IF EXISTS ' . _DB_PREFIX_ . 'helpdesc_orders_data';
    Db::getInstance()->execute($sql);

    $sql = 'DROP TABLE IF EXISTS ' . _DB_PREFIX_ . 'page_helpdesc';
    Db::getInstance()->execute($sql);

    $sql = 'DROP TABLE IF EXISTS ' . _DB_PREFIX_ . 'rating_helpdesc';
    Db::getInstance()->execute($sql);

    return true;
  }

  public function installDb()
  {
    $sql = 'DROP TABLE IF EXISTS ' . _DB_PREFIX_ . 'page_helpdesc';
    Db::getInstance()->execute($sql);

    $sql = 'CREATE TABLE IF NOT EXISTS ' . _DB_PREFIX_ . 'page_helpdesc(
        `id_page_helpdesc` int(11) NOT NULL AUTO_INCREMENT,
        `id_product` int(11) NOT NULL,
        `id_lang` int(11) NOT NULL,
        `id_shop` int(11) NOT NULL,
        `page` longtext NOT NULL,
        `page_number` int(11) NOT NULL,
        `type` varchar(45) NOT NULL,
        `date_add` datetime DEFAULT NULL,
        `rating_count` int(11) DEFAULT NULL,
        `reviews_count` int(11) DEFAULT NULL,
        `total_rating` varchar(10) DEFAULT NULL,
				PRIMARY KEY (`id_page_helpdesc`)
				)
				DEFAULT CHARACTER SET = utf8
				';
    Db::getInstance()->execute($sql);

    $sql = 'DROP TABLE IF EXISTS ' . _DB_PREFIX_ . 'helpdesc_orders_data';
    Db::getInstance()->execute($sql);

    $sql = 'CREATE TABLE IF NOT EXISTS ' . _DB_PREFIX_ . 'helpdesc_orders_data(
				id_helpdesc_order_data int(11) NOT NULL AUTO_INCREMENT,
				id_order int(11) NOT NULL,
				id_lang int(11) NOT NULL,
				id_shop int(11) NOT NULL,
				id_product int(11) NOT NULL,
				id_status int(11) NOT NULL,
				product_name varchar(128) NOT NULL,
				product_link varchar(128) NOT NULL,
				product_img varchar(128) NOT NULL,
				store_name varchar(128) NOT NULL,
				customer varchar(128) NOT NULL,
				email varchar(128) NOT NULL,
				added_review int(11) NOT NULL,
				count_message_sent int(11) NOT NULL,
				date_message_sent varchar(128) NOT NULL,
				date_order varchar(128) NOT NULL,
				date_update varchar(128) NOT NULL,
				id int(11) NOT NULL,
				unsubscribe int(11) NOT NULL,
				PRIMARY KEY (`id_helpdesc_order_data`)
				)
				DEFAULT CHARACTER SET = utf8
				';
    Db::getInstance()->execute($sql);

    return true;
  }

  public function hookDisplayProductExtraContent( $params )
  {
    $tpl = $this->_getTplForProduct(Tools::getValue('id_product'));
    $array[] = ( new PrestaShop\PrestaShop\Core\Product\ProductExtraContent() )->setTitle($this->l('Product Reviews'))->setContent($tpl);

    return $array;
  }

  private function _getTplForProduct( $productId )
  {
    $tpl = $this->getReviewsContent($productId);

    if( !$tpl ){
      return $this->_getRegistrationInfo();
    }

    $this->context->smarty->assign(array(
        'tpl' => $tpl,
      ));

    return $this->display(__FILE__, 'views/templates/hook/product_reviews.tpl');
  }

  private function _getRegistrationInfo()
  {
    $tpl = Context::getContext()->smarty->createTemplate(_PS_MODULE_DIR_ . 'mpm_helpdesc/views/templates/hook/registration_info.tpl');
    $tpl->assign(
      array(
        'domain'  => Tools::getShopDomainSsl(true) . __PS_BASE_URI__,
      )
    );

    return $tpl->fetch();
  }

  public function upgradeModule1_0_7()
  {
    $sql = 'DROP TABLE IF EXISTS ' . _DB_PREFIX_ . 'rating_helpdesc';
    Db::getInstance()->execute($sql);

    Db::getInstance()->execute('TRUNCATE ' . _DB_PREFIX_ . 'page_helpdesc');

    $sql = '
      ALTER TABLE ' . _DB_PREFIX_ . 'page_helpdesc 
      ADD COLUMN `rating_count` INT(11) NULL AFTER `date_add`,
      ADD COLUMN `reviews_count` INT(11) NULL AFTER `rating_count`,
      ADD COLUMN `total_rating` VARCHAR(10) NULL AFTER `reviews_count`;
    ';

    return Db::getInstance()->execute($sql);
  }

  public function upgradeModule1_0_9()
  {

    $this->registerHook('displayDedicatedReviewsPage');

    Db::getInstance()->execute('TRUNCATE ' . _DB_PREFIX_ . 'page_helpdesc');

    $sql = '
          ALTER TABLE ' . _DB_PREFIX_ . 'page_helpdesc 
          ADD COLUMN `page_number` INT(11) NULL AFTER `reviews_count`,
        ';
    Db::getInstance()->execute($sql);

    return true;
  }

  public function upgradeHelpDesc( $version )
  {
    $shop = new Shop($this->_shopId, $this->_langId);
    $domain = $shop->domain . $shop->physical_uri;
    $domain = rtrim($domain, "/");

    $data = array(
      'version' => $version,
      'domain'  => $domain,
    );
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, MYPRESTAREVIEWS_URL . 'api/synchronization/update-module-varsion/');
    curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $results = curl_exec($ch);
    curl_close($ch);

    return true;
  }

  public function upgradeModule2_0_0()
  {

    $shop = new Shop($this->_shopId, $this->_langId);
    $domain = $shop->domain . $shop->physical_uri;
    $domain = rtrim($domain, "/");
    $data = array(
        'domain'  => $domain,
        'id_shop' => $shop->id,
    );
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, MYPRESTAREVIEWS_URL . 'api/index/get-views-files/');
    curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $results = curl_exec($ch);
    curl_close($ch);
    $results = json_decode($results, true);

    if( $results ){
      $views_folder = _PS_MODULE_DIR_ . 'mpm_helpdesc/views/';
      foreach( Shop::getShops() as $shop ){
        Db::getInstance()->delete('page_helpdesc', 'id_shop = ' . (int)$shop['id_shop']);
        if( isset($results['reviews_css']) && $results['reviews_css'] ){
          if( !file_exists($views_folder . 'css/' . $shop['id_shop'] . '/') ){
            mkdir($views_folder . 'css/' . $shop['id_shop'] . '/', 0777, true);
          }
          file_put_contents($views_folder . 'css/' . $shop['id_shop'] . '/myprestareviews.css', file_get_contents($results['reviews_css'] . $shop['id_shop'] . '/myprestareviews.css'));
          file_put_contents($views_folder . 'css/' . $shop['id_shop'] . '/myprestareviews_rating.css', file_get_contents($results['reviews_css'] . $shop['id_shop'] . '/myprestareviews_rating.css'));
        }
        if( isset($results['reviews_js']) && $results['reviews_js'] ){
          file_put_contents($views_folder . 'js/myprestareviews.js', file_get_contents($results['reviews_js']));
        }
      }
    }
    
    return true;
  }

  public function upgradeModule1_1_1()
  {
    $shop = new Shop($this->_shopId, $this->_langId);
    $domain = $shop->domain . $shop->physical_uri;
    $domain = rtrim($domain, "/");
    $data = array(
      'domain'  => $domain,
      'id_shop' => $shop->id,
    );
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, MYPRESTAREVIEWS_URL . 'api/index/get-views-files/');
    curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $results = curl_exec($ch);
    curl_close($ch);
    $results = json_decode($results, true);

    if( $results ){
      $views_folder = _PS_MODULE_DIR_ . 'mpm_helpdesc/views/';
      foreach( Shop::getShops() as $shop ){
        if( isset($results['reviews_css']) && $results['reviews_css'] ){
          if( !file_exists($views_folder . 'css/' . $shop['id_shop'] . '/') ){
            mkdir($views_folder . 'css/' . $shop['id_shop'] . '/', 0777, true);
          }
          file_put_contents($views_folder . 'css/' . $shop['id_shop'] . '/myprestareviews.css', file_get_contents($results['reviews_css'] . $shop['id_shop'] . '/myprestareviews.css'));
          file_put_contents($views_folder . 'css/' . $shop['id_shop'] . '/myprestareviews_rating.css', file_get_contents($results['reviews_css'] . $shop['id_shop'] . '/myprestareviews_rating.css'));
        }
        if( isset($results['reviews_js']) && $results['reviews_js'] ){
          file_put_contents($views_folder . 'js/myprestareviews.js', file_get_contents($results['reviews_js']));
        }
      }
    }

    return true;
  }

  public function upgradeModule1_0_4()
  {
    $shop = new Shop($this->_shopId, $this->_langId);
    $domain = $shop->domain . $shop->physical_uri;
    $domain = rtrim($domain, "/");
    $url_folder_css = md5(Tools::getShopDomain(false) . __PS_BASE_URI__);

    $data = array(
      'url_folder_css'     => $url_folder_css,
      'id_lang'            => $this->_langId,
      'version_prestashop' => _PS_VERSION_,
      'domain'             => $domain,
    );
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, MYPRESTAREVIEWS_URL . 'api/index/update-css-file/');
    curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_exec($ch);
    curl_close($ch);

    Db::getInstance()->delete('page_helpdesc', 'id_shop = ' . (int)$this->_shopId);

    return true;
  }

  public function getContent()
  {

    if( Tools::getValue('configure') == 'mpm_helpdesc' ){
      $this->context->controller->addCSS($this->_path . 'views/css/mpm_helpdesc.css');
      $this->context->controller->addCSS($this->_path . 'views/css/style.css');
      $this->context->controller->addJS($this->_path . 'views/js/mpm_helpdesc.js');
    }
    $form = array(
      'form' => array(
        'legend' => array(
          'title' => $this->l('Settings'),
          'icon'  => 'icon-cogs'
        ),
        'input'  => array(
          array(
            'type'             => 'html',
            'form_group_class' => 'form_group_welcome',
            'name'             => $this->initFormWelcome(),
          ),
        ),
      )
    );

    $default_lang = (int)Configuration::get('PS_LANG_DEFAULT');
    $helper = new HelperForm();
    $helper->module = $this;
    $helper->default_form_language = $default_lang;
    $helper->allow_employee_form_lang = $default_lang;
    $helper->currentIndex = $this->context->link->getAdminLink('AdminModules', false) . '&configure=' . $this->name . '&tab_module=' . $this->tab . '&module_name=' . $this->name;
    $helper->token = Tools::getAdminTokenLite('AdminModules');
    $helper->submit_action = 'submitHelpdesc';
    $helper->tpl_vars = array(
      'languages'   => $this->context->controller->getLanguages(),
      'id_language' => $this->context->language->id
    );

    return $helper->generateForm(array( $form ));
  }

  public function initFormWelcome()
  {

    $secure_key = Tools::getValue('secure_key', Configuration::get('GOMAKOIL_HELPDESCR_SECURE_KEY'));
    $filePerms = Tools::substr(sprintf('%o', fileperms(_PS_MODULE_DIR_ . 'mpm_helpdesc/synchronization.php')), -3);
    $folderPerms = Tools::substr(sprintf('%o', fileperms(_PS_MODULE_DIR_ . 'mpm_helpdesc/')), -3);

    $curl = false;
    if( extension_loaded('curl') ){
      $curl = true;
    }

    $dedicated_reviews_page_link = Context::getContext()->link->getModuleLink('mpm_helpdesc', 'DisplayDedicatedReviews');

    if( version_compare(_PS_VERSION_, '1.7', '<') == true ){
      $admin_folder = str_replace(_PS_ROOT_DIR_ . '/', null, basename(_PS_ADMIN_DIR_));
      $path = Tools::getShopDomainSsl(true, true) . __PS_BASE_URI__ . $admin_folder . '/';
      $meta_page_link = $path . Context::getContext()->link->getAdminLink('AdminMeta', false);
    } else{
      $meta_page_link = Tools::getShopDomainSsl(true, true) . Context::getContext()->link->getAdminLink('AdminMeta', false);
    }


    $this->context->smarty->assign(array(
        'module_path'                 => Tools::getShopDomainSsl(true, true) . __PS_BASE_URI__ . basename(_PS_MODULE_DIR_) . '/mpm_helpdesc/',
        'file_perms'                  => $filePerms,
        'folder_perms'                => $folderPerms,
        'dedicated_reviews_page_link' => $dedicated_reviews_page_link,
        'php_zip'                     => class_exists('ZipArchive'),
        'max_execution_time'          => ini_get('max_execution_time'),
        'memory_limit'                => ini_get('memory_limit'),
        'secure_key'                  => $secure_key,
        'meta_page_link'              => $meta_page_link,
        'curl'                        => $curl,
        'basePath'                    => _PS_BASE_URL_SSL_ . __PS_BASE_URI__,
        'domain'                       => Tools::getShopDomainSsl(true) . __PS_BASE_URI__,
      ));

    return $this->display(__FILE__, 'views/templates/hook/welcome.tpl');
  }


  public function hookModuleRoutes( $params )
  {
    return array(
      'display-question-home' => array(
        'controller' => 'DisplayQuestion',
        'rule'       => 'questions/',
        'keywords'   => array(
          'meta_keywords' => array( 'regexp' => '[_a-zA-Z0-9-\pL]*' ),
          'meta_title'    => array( 'regexp' => '[_a-zA-Z0-9-\pL]*' ),
        ),
        'params'     => array(
          'fc'     => 'module',
          'module' => 'mpm_helpdesc'
        )
      ),
      'display-question'      => array(
        'controller' => 'DisplayQuestion',
        'rule'       => 'questions/key{/:key}/',
        'keywords'   => array(
          'key'           => array(
            'regexp' => '[_a-zA-Z0-9-\pL]*',
            'param'  => 'key',
          ),
          'meta_keywords' => array( 'regexp' => '[_a-zA-Z0-9-\pL]*' ),
          'meta_title'    => array( 'regexp' => '[_a-zA-Z0-9-\pL]*' ),
        ),
        'params'     => array(
          'fc'     => 'module',
          'module' => 'mpm_helpdesc'
        )
      ),
      'display-notification'  => array(
        'controller' => 'DisplayNotification',
        'rule'       => 'notification{/:key}/',
        'keywords'   => array(
          'key'           => array(
            'regexp' => '[_a-zA-Z0-9-\pL]*',
            'param'  => 'key',
          ),
          'meta_keywords' => array( 'regexp' => '[_a-zA-Z0-9-\pL]*' ),
          'meta_title'    => array( 'regexp' => '[_a-zA-Z0-9-\pL]*' ),
        ),
        'params'     => array(
          'fc'     => 'module',
          'module' => 'mpm_helpdesc'
        )
      ),
      'display-notification2' => array(
        'controller' => 'DisplayNotification',
        'rule'       => 'notification{/:key}{/:value}/',
        'keywords'   => array(
          'key'           => array(
            'regexp' => '[_a-zA-Z0-9-\pL]*',
            'param'  => 'key',
          ),
          'value'         => array(
            'regexp' => '[_a-zA-Z0-9-\pL]*',
            'param'  => 'value',
          ),
          'meta_keywords' => array( 'regexp' => '[_a-zA-Z0-9-\pL]*' ),
          'meta_title'    => array( 'regexp' => '[_a-zA-Z0-9-\pL]*' ),
        ),
        'params'     => array(
          'fc'     => 'module',
          'module' => 'mpm_helpdesc'
        )
      ),

    );
  }


  public function hookDisplayHeader()
  {

    $time = Configuration::get('HELPDESC_CSS_TIME');

    if( !$time ){
      $time = time();
      Configuration::updateValue('HELPDESC_CSS_TIME', $time);
    }

    $this->context->controller->addJqueryPlugin('fancybox');

    $currentPage = $this->context->controller->php_self;

    if( _PS_VERSION_ >= 1.7 ){

      if( $currentPage == 'product' ){
        $this->context->controller->registerStylesheet('myprestareviews_css', 'modules/mpm_helpdesc/views/css/' . Context::getContext()->shop->id . '/myprestareviews.css', array(
          'media'    => 'all',
          'priority' => 150,
          'server'   => 'local'
        ));
      }

      $this->context->controller->registerStylesheet('myprestareviews_css_rating', 'modules/mpm_helpdesc/views/css/' . Context::getContext()->shop->id . '/myprestareviews_rating.css', array(
        'media'    => 'all',
        'priority' => 150,
        'server'   => 'local'
      ));

      $this->context->controller->registerJavascript('myprestareviews_js', 'modules/mpm_helpdesc/views/js/myprestareviews.js', array(
        'media'    => 'all',
        'position' => 'bottom',
        'priority' => 150
      ));

      $this->context->controller->registerStylesheet('helpdesc', 'modules/mpm_helpdesc/views/css/helpdesc.css', array(
        'media'    => 'all',
        'priority' => 150
      ));
      $this->context->controller->registerJavascript('helpdesc', 'modules/mpm_helpdesc/views/js/helpdesc.js', array(
        'media'    => 'all',
        'position' => 'bottom',
        'priority' => 150
      ));
    } else{

      if( $currentPage == 'product' ){
        $this->context->controller->addCSS($this->_path . 'views/css/' . Context::getContext()->shop->id . '/myprestareviews.css');
      }

      $this->context->controller->addCSS($this->_path . 'views/css/' . Context::getContext()->shop->id . '/myprestareviews_rating.css');
      $this->context->controller->addJS($this->_path . 'views/js/myprestareviews.js');

      $this->context->controller->addCSS($this->_path . 'views/css/helpdesc.css');
      $this->context->controller->addJS($this->_path . 'views/js/helpdesc.js');
    }
  }

  public function hookDisplayProductTab()
  {
    if( _PS_VERSION_ < 1.7 ){
      $tarif = (int)Configuration::getGlobalValue('TARIF_ACTIVE_' . $this->_shopId);

      if( !$tarif ){
        return false;
      }

      return $this->display(__FILE__, 'views/templates/hook/tab.tpl');
    }
  }

  public function hookDisplayProductTabContent( $params )
  {
    if( version_compare(_PS_VERSION_, "1.7", "<") ){
      return $this->getReviewsContent($params['product']->id);
    }
  }

  public function hookDisplayFooterProduct( $params )
  {
    if( version_compare(_PS_VERSION_, "1.7", ">=") ){
      $tpl = $this->getReviewsContent($params['product']['id_product']);
      if( !$tpl ){
        return false;
      }

      $this->context->smarty->assign(array(
          'tpl' => $tpl,
        ));

      return $this->display(__FILE__, 'views/templates/hook/footer-product.tpl');
    }
  }

  public function replaceReviewsWords( $tpl, $isLogged )
  {
    $name_customer = "";
    $email_customer = "";
    if( $isLogged ){
      $name_customer = Context::getContext()->customer->firstname . " " . Context::getContext()->customer->lastname;
      $email_customer = Context::getContext()->customer->email;
      $tpl = str_replace("error_logged", '', $tpl);
    }
    $tpl = str_replace("[name_customer]", $name_customer, $tpl);

    return str_replace("[email_customer]", $email_customer, $tpl);
  }

  public function hookDisplayRatingProduct( $rating )
  {
    $tarif = (int)Configuration::getGlobalValue('TARIF_ACTIVE_' . $this->_shopId);

    if( !$tarif ){
//      return false;
    }

    $ratingType = false;

    if( isset($rating['type']) ){
      $ratingType = $rating['type'];
    }

    if( $ratingType == self::PRODUCT_RATING ){
      $rating = $this->_getProductRating($rating['id_product']);
    } else{
      $rating = $this->getRating($rating['id_product'], $ratingType);
    }

    return $rating;
  }

  private function _getProductRating( $idProduct )
  {
    $tpl = Context::getContext()->smarty->createTemplate(_PS_MODULE_DIR_ . 'mpm_helpdesc/views/templates/hook/product_rating.tpl');
    $tpl->assign(
      array(
        'id_product'  => $idProduct,
      )
    );

    return $tpl->fetch();
  }

    public function getRating($productId, $ratingType)
    {
        $tarif = (int)Configuration::getGlobalValue('TARIF_ACTIVE_' . $this->_shopId);
        if( !$tarif ){
          $review = array(
            'reviews_count' => 0
          );
        }
        else{
          $review = $this->getPageContent($productId, 'reviews');
        }

        if (!$ratingType || $ratingType == self::STARS || $ratingType == self::CATEGORY
                || $ratingType == self::REVIEWS_COUNT || $ratingType == self::RATING_COUNT
                || $ratingType == self::TOTAL_RATING || $ratingType == self::WRITE_REVIEW || $ratingType == self::ASK_QUESTION) {
            $tpl = Context::getContext()->smarty->createTemplate(_PS_MODULE_DIR_ . 'mpm_helpdesc/views/templates/hook/rating.tpl');
            if (isset($review['total_rating']) && $review['total_rating'] && (!$ratingType || $ratingType == self::STARS || $ratingType == self::CATEGORY)) {
                $review['total_rating'] = $this->_toNearestHalf($review['total_rating']);
            }

            $psVersion = 'PS_16_';
            if (_PS_VERSION_ >= 1.7) {
                $psVersion = 'PS_17_';
            }

            $productLink = Context::getContext()->link->getProductLink($productId);

            $tpl->assign(
                    array(
                            'rating_type'  => $ratingType,
                            'review'       => $review,
                            'ps_version'   => $psVersion,
                            'product_link' => $productLink
                    )
            );

            return $tpl->fetch();
        }

        return false;
    }

    private function _toNearestHalf($number, $step = 0.5, $sub = 0)
    {
        $number += $sub;
        if ($step == 0 || $step == 1) return round($number) - $sub;

        return (round($number / $step) * $step) - $sub;
    }

    public function getBought($id_product, $id_customer)
    {
        $sql = "
			SELECT *
      FROM " . _DB_PREFIX_ . "orders o
      INNER JOIN " . _DB_PREFIX_ . "order_detail as od
      ON o.id_order = od.id_order
      WHERE o.id_customer = " . (int)$id_customer . "
      AND od.product_id = " . (int)$id_product . "
			";
        $res = Db::getInstance(_PS_USE_SQL_SLAVE_)->executeS($sql);

        if (isset($res[0]['id_order']) && $res[0]['id_order']) {
            return 1;
        }
        return 0;
    }



    public function getPageContent($id_product = false, $reviews_type = false, $p = false)
    {

        $where = "";
        $id_shop = Context::getContext()->shop->id;
        $id_lang = Context::getContext()->language->id;

        if ($id_product) {
            $where .= ' AND p.id_product = ' . (int)$id_product;
        }

        if ($reviews_type) {
            $where .= ' AND p.type = "'.$reviews_type.'"';
        }

        if ($reviews_type !== 'reviews' && $p) {
            $where .= ' AND p.page_number = '.(int)$p;
        }

        $sql = 'SELECT *
        FROM ' . _DB_PREFIX_ . 'page_helpdesc as p
        WHERE p.id_shop=' . (int)$id_shop . '
        AND p.id_lang=' . (int)$id_lang . '
        ' . $where . '
        ORDER BY p.id_page_helpdesc DESC
       ';
        $res = Db::getInstance()->ExecuteS($sql);
        if (isset($res[0]) && $res[0]) {
            return $res[0];
        }
        return false;
    }

    public function getReviewsContent($id_product)
    {
		
        $tarif = (int)Configuration::getGlobalValue('TARIF_ACTIVE_' . $this->_shopId);
        $isLogged = Context::getContext()->customer->isLogged();
        $tpl = false;
        $bought = 0;

        if (!$tarif) {
            return false;
        }

        $id_customer = Context::getContext()->customer->id;

        if ($id_customer) {
            $bought = $this->getBought($id_product, $id_customer);
        }

        $page = $this->getPageContent($id_product, 'reviews');

        if (isset($page['page']) && $page['page']) {
            $tpl = $this->replaceReviewsWords($page['page'], $isLogged);
        }

        $this->context->smarty->assign(
                array(
                        'isLogged'   => $isLogged,
                        'id_shop'    => $this->_shopId,
                        'id_lang'    => $this->_langId,
                        'id_product' => $id_product,
                        'page_content' => $tpl,
                        'bought'     => $bought,
                        'basePath'   => _PS_BASE_URL_SSL_ . __PS_BASE_URI__,
                )
        );
        return $this->display(__FILE__, 'views/templates/hook/tab-content.tpl');
    }


    public function hookDisplayDedicatedReviewsPage($params)
    {

        $tpl = false;
        $isLogged = Context::getContext()->customer->isLogged();
        $type_reviews = 'dedicated_reviews';
        $type = 'products';
        $p = 1;
        if(isset($params['params']['type']) && $params['params']['type']){
            $type = $params['params']['type'];
        }
        if(isset($params['params']['p']) && $params['params']['p']){
            $p = $params['params']['p'];
        }

        if($type == 'store'){
            $type_reviews = 'store_reviews';
        }

        $page = $this->getPageContent(false, $type_reviews, $p);
        if (isset($page['page']) && $page['page']) {
            $tpl = $this->replaceReviewsWords($page['page'], $isLogged);
        }

         $this->context->smarty->assign(
                array(
                        'id_shop'  => $this->_shopId,
                        'id_lang'  => $this->_langId,
                        'basePath' => _PS_BASE_URL_SSL_ . __PS_BASE_URI__,
                        'page'     => $tpl,
                        'isLogged' => $isLogged,
                        'type'     => $type,
                        'p'        => $p,
                )
        );
        return $this->display(__FILE__, 'views/templates/front/reviews-page.tpl');
    }

}

