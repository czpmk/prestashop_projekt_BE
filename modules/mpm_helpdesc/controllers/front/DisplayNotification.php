<?php

class mpm_helpdescDisplayNotificationModuleFrontController extends ModuleFrontController
{

  private $_shopId;
  private $_langId;

  public function __construct()
  {

    $this->display_column_left = false;
    if( Tools::getValue('content_only')){
      $this->display_header = false;
      $this->display_footer = false;
    }

    parent::__construct();
    $this->_shopId = Context::getContext()->shop->id;
    $this->_langId = Context::getContext()->language->id;
  }

  public function init()
  {
    parent::init();
  }

  public function initContent()
  {
    $data = false;
    $title = '';
    $title2 = '';
    $descr = '';
    $message = '';
    $link = new Link();
    $key = Tools::getValue('key');
    $value = Tools::getValue('value');

    parent::initContent();

    if (empty($key) || empty($key)) {
      Controller::getController('PageNotFoundController')->run();
      return false;
    }

    if($key == 'success'){
      $meta_title = Module::getInstanceByName('mpm_helpdesc')->l('Success!', 'DisplayNotification');
      $meta_description = Module::getInstanceByName('mpm_helpdesc')->l('Success!', 'DisplayNotification');
      $meta_keywords = Module::getInstanceByName('mpm_helpdesc')->l('Success!', 'DisplayNotification');
      $path = '<span itemprop="title">'.Module::getInstanceByName('mpm_helpdesc')->l('Success', 'DisplayNotification').'</span>';

      $title = Module::getInstanceByName('mpm_helpdesc')->l('Thanks for your review!');
      $descr = Module::getInstanceByName('mpm_helpdesc')->l('Your review will be posted after moderation.');

    }

    if($key == 'error'){
      $meta_title = Module::getInstanceByName('mpm_helpdesc')->l('Error!', 'DisplayNotification');
      $meta_description = Module::getInstanceByName('mpm_helpdesc')->l('Error!', 'DisplayNotification');
      $meta_keywords = Module::getInstanceByName('mpm_helpdesc')->l('Error!', 'DisplayNotification');
      $path = '<span itemprop="title">'.Module::getInstanceByName('mpm_helpdesc')->l('Error', 'DisplayNotification').'</span>';

      $title = Module::getInstanceByName('mpm_helpdesc')->l('Woops.. An error occured');
      $descr = Module::getInstanceByName('mpm_helpdesc')->l('You must fill all fields to leave a review. Please go back and try again.');
    }

    if($key == 'unsubscribe'){
      Db::getInstance()->update('helpdesc_orders_data', array('unsubscribe' => 1), 'md5(email) = "'.pSQL($value).'"');
      $url = $link->getPageLink('display-notification2', true, null, 'key=subscribe&value='.$value);
      $meta_title = Module::getInstanceByName('mpm_helpdesc')->l('Unsubscribe!', 'DisplayNotification');
      $meta_description = Module::getInstanceByName('mpm_helpdesc')->l('Unsubscribe!', 'DisplayNotification');
      $meta_keywords = Module::getInstanceByName('mpm_helpdesc')->l('Unsubscribe!', 'DisplayNotification');
      $path = '<span itemprop="title">'.Module::getInstanceByName('mpm_helpdesc')->l('Unsubscribe', 'DisplayNotification').'</span>';

      $title = Module::getInstanceByName('mpm_helpdesc')->l('Unsubscribe Success!');
      $descr = Module::getInstanceByName('mpm_helpdesc')->l('You have successfully unsubscribed from the newsletter. If you make a mistake by clicking Unsubscribe');
      $descr .= '<a href="'.$url.'">'.Module::getInstanceByName('mpm_helpdesc')->l(' here ').'</a>';
      $descr .= Module::getInstanceByName('mpm_helpdesc')->l(' to receive emails again.');
    }

    if($key == 'subscribe'){
      Db::getInstance()->update('helpdesc_orders_data', array('unsubscribe' => 0), 'md5(email) = "'.pSQL($value).'"');
      $url = $link->getPageLink('display-notification2', true, null, 'key=unsubscribe&value='.$value);
      $meta_title = Module::getInstanceByName('mpm_helpdesc')->l('Subscribe!', 'DisplayNotification');
      $meta_description = Module::getInstanceByName('mpm_helpdesc')->l('Subscribe!', 'DisplayNotification');
      $meta_keywords = Module::getInstanceByName('mpm_helpdesc')->l('Subscribe!', 'DisplayNotification');
      $path = '<span itemprop="title">'.Module::getInstanceByName('mpm_helpdesc')->l('Subscribe', 'DisplayNotification').'</span>';

      $title = Module::getInstanceByName('mpm_helpdesc')->l('Subscribe Success!');

      $descr = Module::getInstanceByName('mpm_helpdesc')->l('You have successfully subscribed from the newsletter. If you make a mistake by clicking "Subscribe"');
      $descr .= '<a href="'.$url.'">'.Module::getInstanceByName('mpm_helpdesc')->l(' here ').'</a>';
      $descr .= Module::getInstanceByName('mpm_helpdesc')->l(' to unsubscribed emails again.');
    }

    if($key == 'reviews'){
      $data = explode('_', $value);
      $meta_title = Module::getInstanceByName('mpm_helpdesc')->l('Add Review', 'DisplayNotification');
      $meta_description = Module::getInstanceByName('mpm_helpdesc')->l('Add Review', 'DisplayNotification');
      $meta_keywords = Module::getInstanceByName('mpm_helpdesc')->l('Add Review', 'DisplayNotification');
      $path = '<span itemprop="title">'.Module::getInstanceByName('mpm_helpdesc')->l('Add Review', 'DisplayNotification').'</span>';

      $title = Module::getInstanceByName('mpm_helpdesc')->l('Woops.. An error occured');
      $descr = Module::getInstanceByName('mpm_helpdesc')->l('You must fill all fields to leave a review. Please go back and try again.');
    }

    $this->context->smarty->assign(array(
      'domain'  => Tools::getShopDomainSsl(true) . __PS_BASE_URI__,
      'basePath'         => _PS_BASE_URL_SSL_ . __PS_BASE_URI__,
      'path'             => $path,
      'meta_title'       => $meta_title,
      'meta_description' => $meta_description,
      'meta_keywords'    => $meta_keywords,
      'title'            => $title,
      'title2'           => $title2,
      'descr'            => $descr,
      'message'          => $message,
      'key'              => $key,
      'data'             => $data,
    ));

    $template_path = _PS_VERSION_ >= 1.7 ? 'module:mpm_helpdesc/views/templates/front/notification17.tpl' : 'notification.tpl';
    $this->setTemplate($template_path);
  }

  public function canonicalRedirection($canonical_url = '')
  {
    return false;
  }

  public function getTemplateVarPage()
  {
    $page = parent::getTemplateVarPage();
    $key = Tools::getValue('key');

    if($key == 'success'){
      $meta_title = Module::getInstanceByName('mpm_helpdesc')->l('Success!', 'DisplayNotification');
      $meta_description = Module::getInstanceByName('mpm_helpdesc')->l('Success!', 'DisplayNotification');
      $meta_keywords = Module::getInstanceByName('mpm_helpdesc')->l('Success!', 'DisplayNotification');
    }

    if($key == 'error'){
      $meta_title = Module::getInstanceByName('mpm_helpdesc')->l('Error!', 'DisplayNotification');
      $meta_description = Module::getInstanceByName('mpm_helpdesc')->l('Error!', 'DisplayNotification');
      $meta_keywords = Module::getInstanceByName('mpm_helpdesc')->l('Error!', 'DisplayNotification');
    }

    if($key == 'unsubscribe'){
      $meta_title = Module::getInstanceByName('mpm_helpdesc')->l('Unsubscribe!', 'DisplayNotification');
      $meta_description = Module::getInstanceByName('mpm_helpdesc')->l('Unsubscribe!', 'DisplayNotification');
      $meta_keywords = Module::getInstanceByName('mpm_helpdesc')->l('Unsubscribe!', 'DisplayNotification');
    }

    if($key == 'subscribe'){
      $meta_title = Module::getInstanceByName('mpm_helpdesc')->l('Subscribe!', 'DisplayNotification');
      $meta_description = Module::getInstanceByName('mpm_helpdesc')->l('Subscribe!', 'DisplayNotification');
      $meta_keywords = Module::getInstanceByName('mpm_helpdesc')->l('Subscribe!', 'DisplayNotification');
    }

    if($key == 'reviews'){
      $meta_title = Module::getInstanceByName('mpm_helpdesc')->l('Add new review', 'DisplayNotification');
      $meta_description = Module::getInstanceByName('mpm_helpdesc')->l('Add new review!', 'DisplayNotification');
      $meta_keywords = Module::getInstanceByName('mpm_helpdesc')->l('Add new review!', 'DisplayNotification');
    }

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
    $key = Tools::getValue('key');

    if($key == 'success'){
      $title = Module::getInstanceByName('mpm_helpdesc')->l('Success', 'DisplayNotification');
    }

    if($key == 'error'){
      $title = Module::getInstanceByName('mpm_helpdesc')->l('Error', 'DisplayNotification');
    }

    if($key == 'unsubscribe'){
      $title = Module::getInstanceByName('mpm_helpdesc')->l('Unsubscribe', 'DisplayNotification');
    }

    if($key == 'subscribe'){
      $title = Module::getInstanceByName('mpm_helpdesc')->l('Subscribe', 'DisplayNotification');
    }

    if($key == 'reviews'){
      $title = Module::getInstanceByName('mpm_helpdesc')->l('Add Review', 'DisplayNotification');
    }

    $home =  array(
      'title' => $title,
      'url'   => _PS_BASE_URL_SSL_ . __PS_BASE_URI__,
    );

    $breadcrumb['links'][] = $home;
    return $breadcrumb;
  }

}
