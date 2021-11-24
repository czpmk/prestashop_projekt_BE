<?php


  class mpm_helpdescDisplayDedicatedReviewsModuleFrontController extends ModuleFrontController
  {

    public function __construct()
    {
      $this->_shopId = Context::getContext()->shop->id;
      $this->_langId = Context::getContext()->language->id;
      $this->_psVersion = _PS_VERSION_;

      $tarif = (int)Configuration::getGlobalValue('TARIF_ACTIVE_'.$this->_shopId);

      if(!$tarif){
        Controller::getController('PageNotFoundController')->run();
      }

      $this->display_column_left = false;
      if( Tools::getValue('content_only')){
        $this->display_header = true;
        $this->display_footer = false;
      }

      parent::__construct();
    }


      public function setMedia($isNewTheme = false)
      {
          parent::setMedia($isNewTheme);


          if (_PS_VERSION_ >= 1.7) {
              $this->context->controller->registerStylesheet('myprestareviews_css', 'modules/mpm_helpdesc/views/css/'.Context::getContext()->shop->id.'/myprestareviews.css', array('media' => 'all', 'priority' => 150, 'server' => 'local'));
              $this->context->controller->registerJavascript('myprestareviews_js', 'modules/mpm_helpdesc/views/js/myprestareviews.js' , array('media' => 'all', 'position' => 'bottom', 'priority' => 150));

          } else {
              $this->context->controller->addCSS(__PS_BASE_URI__ . 'modules/mpm_helpdesc/views/css/'.Context::getContext()->shop->id.'/myprestareviews.css');
              $this->context->controller->addJS(__PS_BASE_URI__ . 'modules/mpm_helpdesc/views/js/myprestareviews.js');
          }


      }

      public function initContent()
      {
          parent::initContent();
          $template_path = _PS_VERSION_ >= 1.7 ? 'module:mpm_helpdesc/views/templates/front/dedicated-reviews-ps17.tpl' : 'dedicated-reviews.tpl';
          $type = Tools::getValue('type');
          $p = Tools::getValue('p');

          if (!$type){
              $type = 'products';
          }
          if (!$p) {
              $p = 1;
          }

          $this->context->smarty->assign(array(
                  'ps_version'   => $this->_psVersion,
                  'ps_version'   => $this->_psVersion,
                  'reviews_data' => array('type' => $type, 'p' => $p),
          ));
          $this->setTemplate($template_path);
      }

  }