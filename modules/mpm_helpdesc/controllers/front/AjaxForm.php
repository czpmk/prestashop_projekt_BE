<?php
/**
 * Created by PhpStorm.
 * User: root
 * Date: 04.09.15
 * Time: 20:33
 */


class mpm_helpdescAjaxFormModuleFrontController extends FrontController
{

  private $_helpDescUrl;

  public function initContent()
  {
    if (!$this->ajax) {
      parent::initContent();
    }

    $this->_helpDescUrl = MYPRESTAREVIEWS_URL . 'api/';
  }

  public function displayAjax()
  {
    $json = array();
    try{
      if(Tools::getValue('action') == 'reviewsPagination'){
        $json['page'] = $this->getReviewsList();
      }
      if(Tools::getValue('action') == 'showReviewsContent'){
        $json['page'] = $this->getContentReviews();
      }
      if(Tools::getValue('action') == 'showDedicatedReviewsContent'){
        $json['page'] = $this->getContentDedicatedReviews();
      }
      if(Tools::getValue('action') == 'showQuestionsContent'){
        $json['page'] = $this->getContentQuestions();
      }
      if(Tools::getValue('action') == 'getFormReviews'){
        $json['page'] = $this->getFormReviews();
      }
      if(Tools::getValue('action') == 'saveSecureKey'){
        Configuration::updateValue('GOMAKOIL_HELPDESCR_SECURE_KEY', Tools::getValue('key'));
        $json['success'] = Module::getInstanceByName('mpm_helpdesc')->l('Secure Key successfully saved!');
      }
      die( Tools::jsonEncode($json) );
    }
    catch(Exception $e){
      $json['error'] = $e->getMessage();
      if( $e->getCode() == 10 ){
        $json['error_message'] = $e->getMessage();
      }
    }
    die( Tools::jsonEncode($json) );
  }

  public function getContentQuestions(){
    $key = Tools::getValue('key');
    $id_shop = Tools::getValue('id_shop');
    $id_lang = Tools::getValue('id_lang');
    $isLogged = Tools::getValue('isLogged');
    $tpl = $this->getPageQuestionContentFromHelpDesc($id_shop, $id_lang, $key, $isLogged);
    return $tpl;
  }

  public function getFormReviews(){

    $data = array(
      'id_site'    => Tools::getValue('id_site'),
      'id_shop'    => Tools::getValue('id_shop'),
      'id_lang'    => Tools::getValue('id_lang'),
      'id_order'   => Tools::getValue('id_order'),
      'id_product' => Tools::getValue('id_product'),
      'store_key'  => Configuration::get('GOMAKOIL_HELPDESCR_SECURE_KEY'),
      'version'      => Module::getInstanceByName('mpm_helpdesc')->version,
    );

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $this->_helpDescUrl.'synchronization/get-form-reviews/');
    curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $results = curl_exec($ch);
    curl_close($ch);


    $order = $this->getHelpdescOrderData(Tools::getValue('id_order'), Tools::getValue('id_product'));

    if($order['product_img']){
      $img_src = $order['product_img'];
    }
    $shop = new Shop($order['id_shop'], $order['id_lang']);

    $store_name = $shop->name;
    $base_tpl = $results;
    $base_tpl = str_replace("[product]", '<a class="product_name_reviews" style="text-decoration: none;color: inherit;" href="'.$order['product_link'].'">'.$order['product_name'].'</a>', $base_tpl);
    $base_tpl = str_replace("[date]", $order['date_order'], $base_tpl);
    $base_tpl = str_replace("[user]", $order['customer'], $base_tpl);
    $base_tpl = str_replace("[store_name]", $store_name, $base_tpl);
    $base_tpl = str_replace("[img_src]", $img_src, $base_tpl);
    $base_tpl = str_replace("[customer_name]", $order['customer'], $base_tpl);
    $base_tpl = str_replace("[customer_email]", $order['email'], $base_tpl);
    $base_tpl = str_replace("[id_product]", $order['id_product'], $base_tpl);
    $base_tpl = str_replace("[product_name]", $order['product_name'], $base_tpl);
    $base_tpl = str_replace("[product_link]", $order['product_link'], $base_tpl);
    $base_tpl = str_replace("[id_order]", $order['id_order'], $base_tpl);
    $base_tpl = str_replace("[email_user]", md5($order['email']), $base_tpl);


    return $base_tpl;
  }


  public function getHelpdescOrderData($id_order, $id_product){
    $sql = "
			SELECT *
      FROM " . _DB_PREFIX_ . "helpdesc_orders_data o
      WHERE o.id_order = ".(int)$id_order."
      AND o.id_product = ".(int)$id_product."
			";

    $res = Db::getInstance(_PS_USE_SQL_SLAVE_)->executeS($sql);
    if (isset($res[0]) && $res[0]){
      return $res[0];
    }
    return false;
  }


 public function getReviewsList(){
     $data = Tools::getValue('data');
     $ch = curl_init();
     curl_setopt($ch, CURLOPT_URL, $this->_helpDescUrl.'index/pagination/');
     curl_setopt($ch, CURLOPT_POSTFIELDS, Tools::getValue('data'));
     curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
     $results = curl_exec($ch);
     curl_close($ch);
     $results = json_decode($results, true);
     if(isset($results['page']) && $results['page']){
         $tpl = $this->replaceReviewsWords($results['page'], $data['id_lang'], $data['id_shop']);
         return $this->replaceCustomerData($tpl, $data['isLogged']);
     }
     return false;
 }

 public function getContentReviews(){
    $id_product = Tools::getValue('id_product');
    $id_shop = Tools::getValue('id_shop');
    $id_lang = Tools::getValue('id_lang');
    $isLogged = Tools::getValue('isLogged');
    $pageContent = $this->getPageContentFromHelpDesc($id_shop, $id_lang, $id_product, $isLogged, 'reviews');
    $pageContent = json_decode($pageContent, true);

   if (isset($pageContent['page_content']) && $pageContent['page_content']) {
     $tpl = $pageContent['page_content'];

     $res = array(
        'page'          => pSQL($tpl, true),
        'rating_count'  => $pageContent['rating_count'],
        'reviews_count' => $pageContent['reviews_count'],
        'total_rating'  => $pageContent['total_rating'],
        'id_shop'       => (int)$id_shop,
        'id_lang'       => (int)$id_lang,
        'id_product'    => (int)$id_product,
        'type'          => 'reviews',
        'date_add'      => date('Y-m-d H:i:s'),
      );

      Db::getInstance()->delete('page_helpdesc', 'id_shop = '.(int)$id_shop.' AND id_product = '.(int)$id_product.' AND id_lang = '.(int)$id_lang );
      Db::getInstance(_PS_USE_SQL_SLAVE_)->insert("page_helpdesc", $res);

    return $this->replaceCustomerData($tpl, $isLogged);
   }
   return '';
  }

  public function replaceCustomerData($tpl, $isLogged){
      $name_customer = "";
      $email_customer = "";
      if($isLogged){
          $name_customer = Context::getContext()->customer->firstname." ".Context::getContext()->customer->lastname;
          $email_customer = Context::getContext()->customer->email;
      }
      $tpl = str_replace("[name_customer]", $name_customer, $tpl);
      return str_replace("[email_customer]", $email_customer, $tpl);
  }

  public function replaceReviewsWords($tpl, $id_lang, $id_shop){
      preg_match_all("/\[\d+\]/", $tpl, $matches);
      if(isset($matches[0]) && $matches[0]){
          foreach ($matches[0] as $matche){
              $matche_new = trim($matche, "[");
              $id_product = trim($matche_new, "]");
              $image = $this->getImageLink($id_product, $id_lang);
              $tpl = str_replace($matche, $image, $tpl);
          }
      }

      $link = new Link();
      $page_link = $link->getModuleLink('mpm_helpdesc', 'DisplayDedicatedReviews');

      return str_replace("[dedicated_reviews_page_link]", $page_link, $tpl);
  }


 public function getContentDedicatedReviews(){

    $id_shop = Tools::getValue('id_shop');
    $id_lang = Tools::getValue('id_lang');
    $isLogged = Tools::getValue('isLogged');
    $type_reviews = Tools::getValue('type_reviews');
    $page_number = Tools::getValue('page_number');

    $type = 'dedicated_reviews';
    if($type_reviews == 'store'){
        $type = 'store_reviews';
    }

    $pageContent = $this->getPageContentFromHelpDesc($id_shop, $id_lang, 0, $isLogged, 'dedicated_reviews', $type_reviews, $page_number);
    $pageContent = json_decode($pageContent, true);

   if (isset($pageContent['page_content']) && $pageContent['page_content']) {
       $tpl = $this->replaceReviewsWords($pageContent['page_content'], $id_lang, $id_shop);
       $res = array(
        'page'          => pSQL($tpl, true),
        'rating_count'  => $pageContent['rating_count'],
        'reviews_count' => $pageContent['reviews_count'],
        'total_rating'  => $pageContent['total_rating'],
        'id_shop'       => (int)$id_shop,
        'id_lang'       => (int)$id_lang,
        'id_product'    => 0,
        'type'          => $type,
        'page_number'   => $page_number,
        'date_add'      => date('Y-m-d H:i:s'),
      );

       Db::getInstance(_PS_USE_SQL_SLAVE_)->insert("page_helpdesc", $res);

    return $this->replaceCustomerData($tpl, $isLogged);
   }

   return '';
  }

  public function getImageLink($id_product, $id_lang){

      $prod_obj = new Product((int) $id_product);
      $link = Context::getContext()->link;
      $link_rewrite = $prod_obj->link_rewrite[$id_lang];
      $img = $prod_obj->getCover($prod_obj->id);
      $img_url = $link->getImageLink($link_rewrite, $img['id_image']);

      return $img_url;
  }

  public function getPageContent($id_shop, $id_lang, $id_product){
    $sql = 'SELECT *
        FROM '._DB_PREFIX_.'page_helpdesc as p
        WHERE p.id_shop='.(int)$id_shop.'
        AND p.id_lang='.(int)$id_lang.'
        AND p.id_product='.(int)$id_product.'
       ';
    $res = Db::getInstance()->ExecuteS($sql);
    if(isset($res[0]) && $res[0]){
      return $res[0];
    }
    return false;
  }

  public function getPageContentFromHelpDesc($id_shop, $id_lang, $id_product, $isLogged, $type, $type_dedicated_reviews = false, $page_number = false){

    $data = array(
      'type_reviews' => $type,
      'type_dedicated_reviews' => $type_dedicated_reviews,
      'p'            => $page_number,
      'id_shop'      => $id_shop,
      'id_lang'      => $id_lang,
      'id_product'   => $id_product,
      'isLogged'     => $isLogged,
      'version'      => Module::getInstanceByName('mpm_helpdesc')->version,
      'store_key'    => Configuration::get('GOMAKOIL_HELPDESCR_SECURE_KEY')
    );

    if($type == 'reviews'){
        $link = new Link();
        $data['product_name'] = Product::getProductName($id_product, 0, $id_lang);
        $data['product_link'] = $link->getProductLink($id_product);
    }

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $this->_helpDescUrl);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $results = curl_exec($ch);
    curl_close($ch);

//    var_dump($results); die;

    return $results;
  }

  public function getPageQuestionContentFromHelpDesc($id_shop, $id_lang, $key, $isLogged){
    $data = array(
      'id_shop'  => $id_shop,
      'id_lang'  => $id_lang,
      'key'      => $key,
      'isLogged' => $isLogged,
      'store_key'  => Configuration::get('GOMAKOIL_HELPDESCR_SECURE_KEY'),
      'version'      => Module::getInstanceByName('mpm_helpdesc')->version,
    );
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $this->_helpDescUrl.'questions/key/'.$key.'/');
    curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $results = curl_exec($ch);
    curl_close($ch);
    return $results;
  }



}