<?php


class mpm_helpdescDisplayQuestionModuleFrontController extends ModuleFrontController
{

  private $_shopId;
  private $_langId;

  public function __construct()
  {
    $this->_shopId = Context::getContext()->shop->id;
    $this->_langId = Context::getContext()->language->id;

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

  public function init()
  {
    parent::init();
  }

  public function canonicalRedirection($canonical_url = '')
  {
    return false;
  }

  public function getTemplateVarPage()
  {
    $page = parent::getTemplateVarPage();

    $meta_title = Module::getInstanceByName('mpm_helpdesc')->l('Questions', 'DisplayQuestion');
    $meta_description = Module::getInstanceByName('mpm_helpdesc')->l('Questions', 'DisplayQuestion');
    $meta_keywords = Module::getInstanceByName('mpm_helpdesc')->l('Questions', 'DisplayQuestion');

    $page['meta'] = array(
      'title' => $meta_title,
      'description' => $meta_description,
      'keywords' => $meta_keywords,
      'robots' => 'index',
    );

    return $page;
  }

  public function getBreadcrumbLinks()
  {
    $breadcrumb = parent::getBreadcrumbLinks();
    $home =  array(
      'title' => Module::getInstanceByName('mpm_helpdesc')->l('Questions', 'DisplayQuestion'),
      'url'   => _PS_BASE_URL_SSL_ . __PS_BASE_URI__,
    );

    $breadcrumb['links'][] = $home;
    return $breadcrumb;
  }

  public function initContent()
  {
    parent::initContent();

    $key = Tools::getValue('key');

    if (empty($key) || empty($key)) {
      Controller::getController('PageNotFoundController')->run();
      return false;
    }


    $meta_title = Module::getInstanceByName('mpm_helpdesc')->l('Questions', 'DisplayQuestion');
    $meta_description = Module::getInstanceByName('mpm_helpdesc')->l('Questions', 'DisplayQuestion');
    $meta_keywords = Module::getInstanceByName('mpm_helpdesc')->l('Questions', 'DisplayQuestion');
    $path = '<span itemprop="title">'.Module::getInstanceByName('mpm_helpdesc')->l('Questions', 'DisplayQuestion').'</span>';

    $this->context->smarty->assign(array(
      'path'             => $path,
      'meta_title'       => $meta_title,
      'meta_description' => $meta_description,
      'meta_keywords'    => $meta_keywords,
      'isLogged'         => Context::getContext()->customer->isLogged(),
      'id_shop'          => $this->_shopId,
      'id_lang'          => $this->_langId,
      'key'              => $key,
      'basePath'         => _PS_BASE_URL_SSL_ . __PS_BASE_URI__,
    ));

    $template_path = _PS_VERSION_ >= 1.7 ? 'module:mpm_helpdesc/views/templates/front/question17.tpl' : 'question.tpl';


    $this->setTemplate($template_path);




  }


}
