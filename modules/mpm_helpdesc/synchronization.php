<?php
/**
 * Created by PhpStorm.
 * User: root
 * Date: 20.01.16
 * Time: 15:38
 */

include(dirname(__FILE__).'/../../config/config.inc.php');
Context::getContext()->controller = 'AdminController';
include(dirname(__FILE__).'/../../init.php');

try{
  new synchronization();
}
catch(Exception $e){
  $json = array();

  $json['error'] = $e->getMessage();
  echo Tools::jsonEncode($json);
}

class synchronization
{
  public function __construct()
  {
    $data = array();
    $this->_checkSecureKey();

      

    if(Tools::getValue('send_message')){
      $shop = new Shop(Tools::getValue('id_shop'), Tools::getValue('id_lang'));
      $store_name = $shop->name;
      $message = str_replace('[store_name]', $store_name, Tools::getValue('message'));
      $message_moderator = str_replace('[store_name]', $store_name, Tools::getValue('message_moderator'));
      $data = $this->sendMessages($message, $message_moderator, Tools::unSerialize(Tools::getValue('email_moderators')), Tools::unSerialize(Tools::getValue('email_user')), Tools::getValue('heading'));
    }
    elseif(Tools::getValue('import')){
      $data['import'] = $this->importReviews();
    }
	  elseif(Tools::getValue('import_with_file')){
      $data['product'] = $this->getProductData(Tools::getValue('id_shop'), Tools::getValue('product'), Tools::getValue('identification'));
    }
    elseif(Tools::getValue('added_review')){
      $data['added_review'] = $this->updateOrderData(Tools::getValue('id_shop'), Tools::getValue('id_order'), Tools::getValue('id_product'));
    }
    elseif(Tools::getValue('clear_cache')){
        $data['clear_cache'] = $this->clearCache(Tools::getValue('id_shop'), Tools::getValue('id_product'), Tools::getValue('reviews_rating'), Tools::getValue('dedicated_reviews'));
    }
    elseif(Tools::getValue('count_orders')){
      $data['orders'] = $this->calculateOrders(Tools::getValue('id_shop'), Tools::getValue('id_status'), Tools::getValue('from'), Tools::getValue('to'), Tools::getValue('added'));
    }
    elseif(Tools::getValue('module')){
      $tarif = 0;
      $tarif_info = Tools::getValue('tarif_info');
      $active = Tools::getValue('active');
      if(isset($tarif_info) && $tarif_info > 0 && $active){
        $tarif = 1;
      }
      Configuration::updateGlobalValue('TARIF_ACTIVE_'.Tools::getValue('id_shop'), $tarif);
      $data['version'] = Module::getInstanceByName('mpm_helpdesc')->version;
    }
    elseif(Tools::getValue('orders')){
      $data = $this->updateMessageInform();
    }
    elseif(Tools::getValue('sync_orders')){
      $this->updateOrdersData();
    }
    elseif(Tools::getValue('test_email')){
      $data['mail'] = $this->sendTestEmail();
    }
	 elseif(Tools::getValue('product_img')){
      $data['img'] = $this->getProductImage(Tools::getValue('id_shop'), Tools::getValue('id_product'));
    }
    elseif(Tools::getValue('remove_site')){
      $data['remove'] = $this->disableReviews();
    }
    else{
      if( Tools::getValue('entity_type') == 1 ){
        $data = $this->getLanguages();
      }
      if( Tools::getValue('entity_type') == 2 ){
        $data = $this->getMultistores();
      }
      if( Tools::getValue('entity_type') == 3 ){
        $data = $this->getOrderStatuses();
      }

      if( Tools::getValue('entity_type') == 5 ){
        $data['base_url'] = md5(Tools::getShopDomain(false).__PS_BASE_URI__);
		$data['version_prestashop'] = _PS_VERSION_;
      }

    }
    $data['success'] = true;
    echo Tools::jsonEncode($data);
  }
  
    public function updateReviewsRating($reviews_rating, $where){
      $languages = Language::getLanguages(1);
      $reviews_rating = Tools::unSerialize($reviews_rating);
      Db::getInstance()->delete('page_helpdesc', $where );
      if($reviews_rating){
          foreach ($reviews_rating as $review_rating){
              foreach ($languages as $lang){
                  $new_data = $review_rating;
                  $new_data['type'] = 'reviews';
                  $new_data['date_add'] = date('Y-m-d H:i:s');
                  $new_data['id_lang'] = (int)$lang['id_lang'];
                  Db::getInstance()->insert('page_helpdesc',  $new_data );
              }
          }
      }
      return true;
    }

    public function getProductImage($id_shop, $id_product){
    $cover = Product::getCover($id_product);
    $product = new Product($id_product, false);
    $url_cover = Context::getContext()->link->getImageLink($product->link_rewrite, $cover['id_image']);
    $url_cover = str_replace('http://', Tools::getShopProtocol(), $url_cover);
    return $url_cover;
  }
  
  public function getProductData($id_shop, $prod, $identification){

    $id_product = false;
    $product_name = "";
    $product_link = "";

    if($identification ==  'id_product'){
      $product = new Product($prod, false, Context::getContext()->language->id);
      $url_prod = Context::getContext()->link->getProductLink($product->id);
      $product_link = str_replace('http://', Tools::getShopProtocol(), $url_prod);
      $product_name = $product->name;
      $id_product = $product->id;
    }

    if($identification ==  'reference'){
      $idProduct = $this->getProductByReference($prod);

      if($idProduct){
        $product = new Product($idProduct, false, Context::getContext()->language->id);
        $url_prod = Context::getContext()->link->getProductLink($product->id);
        $product_link = str_replace('http://', Tools::getShopProtocol(), $url_prod);
        $product_name = $product->name;
        $id_product = $product->id;
      }
    }

    return array('id_product' => $id_product, 'product_name' => $product_name, 'product_link' => $product_link);
  }

  public function getProductByReference($reference){

    $sql = "
			SELECT p.id_product
      FROM " . _DB_PREFIX_ . "product p
      WHERE p.reference = '".$reference."'
			";

    $res = Db::getInstance(_PS_USE_SQL_SLAVE_)->executeS($sql);

    if(isset($res[0]['id_product']) && $res[0]['id_product']){
      return $res[0]['id_product'];
    }
    return false;

  }
  public function disableReviews(){
    $result = 0;
    foreach( Shop::getShops() as $shop ){
      Configuration::updateGlobalValue('TARIF_ACTIVE_'.(int)$shop['id_shop'], 0);
      Db::getInstance()->delete('page_helpdesc',  'id_shop = '.(int)$shop['id_shop']  );
      $result = 1;
    }
    return $result;
  }

  public function importReviews(){

    $link = new Link();
    $sql = "
			SELECT pc.*, c.email
      FROM " . _DB_PREFIX_ . "product_comment as pc
      LEFT JOIN " . _DB_PREFIX_ . "customer c
      ON pc.id_customer = c.id_customer
      WHERE 1
			";

    $res = Db::getInstance(_PS_USE_SQL_SLAVE_)->executeS($sql);
    foreach ($res as $key => $val) {
      $res[$key]['product_link'] = $link->getProductLink($val['id_product']);
      $res[$key]['product_name'] = Product::getProductName($val['id_product']);
    }
    return $res;
  }

  public function calculateOrders($id_shop, $id_status, $from, $to, $send_added){
    $update = $this->updateOrdersData();
    if($update){
      $period =  " AND o.date_order  BETWEEN '".pSQL($from)."' AND DATE_ADD('".pSQL($to)."',INTERVAL 1 DAY) ";
      $orders = $this->getOrdersHelpdesc($id_status, $send_added, $id_shop, $period, true);
      $last_letters_sent = (int)Configuration::getGlobalValue('LAST_LETTERS_SENT');

      $last_letters_sent_data = Tools::unSerialize(Configuration::getGlobalValue('LAST_LETTERS_SENT_DATA'));
      Configuration::updateGlobalValue('LAST_LETTERS_SENT', 0);
      Configuration::updateGlobalValue('LAST_LETTERS_SENT_DATA', '');
      return array('last_letters_sent' => $last_letters_sent, 'last_letters_data' => $last_letters_sent_data, 'count_orders' => count($orders));
    }
    return false;
  }

  public function updateOrderData($id_shop, $id_order, $id_product){
    Db::getInstance()->update('helpdesc_orders_data', array('added_review' => 1), 'id_order='.(int)$id_order.' AND id_shop='.(int)$id_shop.' AND id_product='.(int)$id_product);
    return true;
  }

  public function sendTestEmail(){
      $data = Tools::unSerialize(Tools::getValue('data'));
      $order = false;
      $shop = new Shop(Tools::getValue('id_shop'), Tools::getValue('id_lang'));
      $base_tpl = $data['content'];


      $order_data = $this->getOrdersHelpdesc(false, false, false, false, false, true);

      if(isset($order_data[0]) && $order_data[0]){
          $order = $order_data[0];
      }

      if($order){
          $img_src = '';
          if($order['product_img']){
              $img_src = $order['product_img'];
          }
          $base_tpl = str_replace("[product]", '<a class="product_name_reviews" style="text-decoration: none;color: inherit;" href="'.$order['product_link'].'">'.$order['product_name'].'</a>', $base_tpl);
          $base_tpl = str_replace("[date]", $order['date_order'], $base_tpl);
          $base_tpl = str_replace("[user]", $order['customer'], $base_tpl);
          $base_tpl = str_replace("[img_src]", $img_src, $base_tpl);
          $base_tpl = str_replace("[customer_name]", $order['customer'], $base_tpl);
          $base_tpl = str_replace("[customer_email]", $order['email'], $base_tpl);
          $base_tpl = str_replace("[id_product]", $order['id_product'], $base_tpl);
          $base_tpl = str_replace("[product_name]", $order['product_name'], $base_tpl);
          $base_tpl = str_replace("[product_link]", $order['product_link'], $base_tpl);
          $base_tpl = str_replace("[id_order]", $order['id_order'], $base_tpl);
          $base_tpl = str_replace("[email_user]", md5($order['email']), $base_tpl);
          $base_tpl = str_replace('[store_name]', $shop->name, $base_tpl);
          $template_vars = array('{content}' => $base_tpl);
          $this->sendMessage($template_vars, $data['email'], $data['subject']);
      }

      return true;
  }

  public function updateMessageInform(){
    $mails = Tools::unSerialize(Tools::getValue('mails'));
    $letters = Tools::getValue('letters');
    $id_site = Tools::getValue('id_site');
    $last_letters = (int)Configuration::getGlobalValue('LAST_LETTERS_SENT');
    $last_letters_data = Tools::unSerialize(Configuration::getGlobalValue('LAST_LETTERS_SENT_DATA'));

    if (isset($last_letters) && $last_letters){
      $update_letters = $this->updateLetters($last_letters, $last_letters_data, Tools::getValue('id_admin'), $id_site);
      if($update_letters['success']){
        Configuration::updateGlobalValue('LAST_LETTERS_SENT', 0);
        Configuration::updateGlobalValue('LAST_LETTERS_SENT_DATA', 0);
        $letters = $update_letters['letters'];
      }
    }

    if($letters <= 0){
      return array('id_admin' => Tools::getValue('id_admin'), 'letters' => false);
    }

    if(Tools::getValue('id_shop') && Tools::getValue('id_status')){
      $period =  " AND o.date_order  BETWEEN '".pSQL(Tools::getValue('from'))."' AND DATE_ADD('".pSQL(Tools::getValue('to'))."',INTERVAL 1 DAY) ";
      $orders = $this->getOrdersHelpdesc(Tools::getValue('id_status'), Tools::getValue('added'), Tools::getValue('id_shop'), $period, true);
      $send_period = true;
    }
    else{
      $orders = $this->getOrdersHelpdesc();
      $send_period = false;
    }
    return $this->getSendItemMessage($orders, $mails['shops'], $letters, $send_period);
  }

  public function updateLetters($last_letters, $last_letters_sent_data, $id_admin, $id_site){
      $data = array(
        'last_letters' => $last_letters,
        'id_admin'     => $id_admin,
        'id_site'     => $id_site,
        'sent_data'     => $last_letters_sent_data,
      );
      $ch = curl_init();
      curl_setopt($ch, CURLOPT_URL, MYPRESTAREVIEWS_URL . 'api/synchronization/update-letters/');
      curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
      curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
      $results = curl_exec($ch);
      $results = Tools::jsonDecode($results, true);
      return $results;
  }

  public function getSendItemMessage($orders, $mails, $letters, $send_period){

    $res = array();
    $img_src = '';

    foreach ($orders as $order){
      $info_order_return = array(
        'email' => $order['email'],
        'id_shop' => $order['id_shop'],
        'id_order' => $order['id_order'],
        'id_product' => $order['id_product'],
      );

      $sent = (int)Configuration::getGlobalValue('LAST_LETTERS_SENT');
      $sent_data = Tools::unSerialize(Configuration::getGlobalValue('LAST_LETTERS_SENT_DATA'));
      if($order['product_img']){
        $img_src = $order['product_img'];
      }
      $shop = new Shop($order['id_shop'], $order['id_lang']);
      $store_name = $shop->name;
      $base = $mails[$order['id_shop']][$order['id_lang']]['base'];
      $reminders = $mails[$order['id_shop']][$order['id_lang']]['reminders'];

      if(($letters-$sent)<=0){
        Configuration::updateGlobalValue('LAST_LETTERS_SENT', 0);
        Configuration::updateGlobalValue('LAST_LETTERS_SENT_DATA', '');
        return array('id_admin' => Tools::getValue('id_admin'), 'sent' => $sent, 'sent_data' => $sent_data, 'letters' => false);
      }

      $id_status_send = Tools::getValue('id_status');
      $id_status = $base['id_status'];
      if(isset($id_status_send) && $id_status_send){
        $id_status = $id_status_send;
      }

      if(!$order['added_review'] && !$order['unsubscribe'] && (($letters-$sent)>0) && ($id_status == $order['id_status'])){
        $n = $order['id'];
        $day_after = $base['day_after'];
        $few_products = $base['few_products'];
        $max_letters = $base['max_letters'];
        $interval = $base['interval'];
        $sent = false;
        $sent_rem = false;

        if(isset($base['tpl']) && $base['tpl']){

          $base_tpl = $base['tpl'];
          $base_tpl = str_replace("[product]", '<a class="product_name_reviews" style="text-decoration: none;color: inherit;" href="'.$order['product_link'].'?from_email=1">'.$order['product_name'].'</a>', $base_tpl);
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
          $base_subject = $base['subject'];
          $base_subject = str_replace("[store_name]", $store_name, $base_subject);
          if($send_period){
            $sent = $this->sendItem($order['email'], $base_subject, $base_tpl, $info_order_return);
          }
          else{
            $days = ($n*$interval) + $day_after;
            $new_date = strtotime(date('Y-m-d', strtotime($order['date_update'])).' + '.$days.' days');
            $date =  strtotime(date('Y-m-d', time()));
            if((($new_date == $date) && !$order['count_message_sent'] && $order['id']<$max_letters && $few_products) || (($new_date == $date) && !$order['count_message_sent'] && $order['id']<$max_letters && !$few_products && $order['id'] == 0)){
              $sent = $this->sendItem($order['email'], $base_subject, $base_tpl, $info_order_return);

            }
          }
          if($sent){
              $this->updateHelpdescOrdersData($order['id_helpdesc_order_data'], 1);
            $res[] = $order['email'];
          }
        }

        if(isset($reminders) && $reminders && !$send_period){
          foreach ($reminders as $reminder){
            $reminder_tpl = $reminder['tpl'];
            $reminder_tpl = str_replace("[product]", '<a style="text-decoration: none;color: inherit;" href="'.$order['product_link'].'?from_email=1">'.$order['product_name'].'</a>', $reminder_tpl);
            $reminder_tpl = str_replace("[date]", $order['date_order'], $reminder_tpl);
            $reminder_tpl = str_replace("[user]", $order['customer'], $reminder_tpl);
            $reminder_tpl = str_replace("[store_name]", $store_name, $reminder_tpl);
            $reminder_tpl = str_replace("[img_src]", $img_src, $reminder_tpl);
            $reminder_tpl = str_replace("[customer_name]", $order['customer'], $reminder_tpl);
            $reminder_tpl = str_replace("[customer_email]", $order['email'], $reminder_tpl);
            $reminder_tpl = str_replace("[id_product]", $order['id_product'], $reminder_tpl);
            $reminder_tpl = str_replace("[product_name]", $order['product_name'], $reminder_tpl);
            $reminder_tpl = str_replace("[product_link]", $order['product_link'], $reminder_tpl);
            $reminder_tpl = str_replace("[email_user]", md5($order['email']), $reminder_tpl);
            $reminder_tpl = str_replace("[id_order]", $reminder_tpl['id_order'], $base_tpl);
            $reminder_subject = $reminder['subject'];
            $reminder_subject = str_replace("[store_name]", $store_name, $reminder_subject);
            $days = ($n*$interval) + $day_after + $reminder['day_after'];
            $new_date = strtotime(date('Y-m-d', strtotime($order['date_update'])).' + '.$days.' days');
            $date =  strtotime(date('Y-m-d', time()));

            if((($new_date == $date) && $order['count_message_sent'] && $order['id']<$max_letters && $few_products) || (($new_date == $date) && $order['count_message_sent'] && $order['id']<$max_letters && !$few_products && $order['id'] == 0)){
              $sent_rem = $this->sendItem($order['email'], $reminder_subject, $reminder_tpl, $info_order_return);
              $count_message_sent = $this->getCountMessageSent($order['id_helpdesc_order_data']);

              $this->updateHelpdescOrdersData($order['id_helpdesc_order_data'], ($count_message_sent + 1));
            }
            if($sent_rem){
              $res[] = $order['email'];
            }
          }
        }
      }
    }

    $count = (int)Configuration::getGlobalValue('LAST_LETTERS_SENT');
    $sent_data = Tools::unSerialize(Configuration::getGlobalValue('LAST_LETTERS_SENT_DATA'));
    Configuration::updateGlobalValue('LAST_LETTERS_SENT', 0);
    Configuration::updateGlobalValue('LAST_LETTERS_SENT_DATA', '');
    return array('id_admin' => Tools::getValue('id_admin'), 'sent_data' => $sent_data, 'sent' => $count);
  }

  public function updateHelpdescOrdersData($id, $count){
    Db::getInstance()->update('helpdesc_orders_data', array('date_message_sent' => date('Y-m-d', time()), 'count_message_sent' => (int)$count), 'id_helpdesc_order_data='.(int)$id);
  }

  public function getCountMessageSent($id){
    $sql = "
			SELECT o.count_message_sent
      FROM " . _DB_PREFIX_ . "helpdesc_orders_data o
      WHERE o.id_helpdesc_order_data = '".(int)$id."'
			";

    $res = Db::getInstance(_PS_USE_SQL_SLAVE_)->executeS($sql);
    if (isset($res[0]['count_message_sent']) && $res[0]['count_message_sent']){
      return $res[0]['count_message_sent'];
    }
    return 0;
  }

  public function updateOrdersData(){
    $orders_insert = $this->getOrders();
    if($orders_insert){
      $i = 0;
      $order = false;
      foreach ($orders_insert as $value){
        $isset_data = $this->getIssetOrderHelpdesc($value['id_order'], $value['id_product']);
        $date_update = $this->getDateStatus($value['id_order']);
        if($isset_data){
          $unsubscribe = $this->getUnsubscribe($value['email']);
          $data = array(
            'id_status'    => (int)$value['id_status'],
            'date_update'  => pSQL($date_update),
            'unsubscribe'  => (int)$unsubscribe,
          );
          Db::getInstance()->update('helpdesc_orders_data', $data, 'id_helpdesc_order_data='.(int)$isset_data);
        }
        else{

          if($order !== $value['id_order']){
            $order = $value['id_order'];
            $i = 0;
          }

          $imageType = null;
          $minHeight = 0;
          $imageTypes = ImageType::getImagesTypes('products');
          foreach ($imageTypes as $type) {
            if ($type['height'] >= 250) {
              if( $type['height'] < $minHeight ){
                $imageType = $type['name'];
                $minHeight = $type['height'];
              }
              else{
                if( !$imageType ){
                  $imageType = $type['name'];
                  $minHeight = $type['height'];
                }
              }
            }
          }

          try{
              $shop = new Shop($value['id_shop'], $value['id_lang']);
              $cover = Product::getCover($value['id_product']);
              $product = new Product($value['id_product'], false, $value['id_lang']);
              $url_cover = Context::getContext()->link->getImageLink($product->link_rewrite, $cover['id_image'], $imageType);
              $url_cover = str_replace('http://', Tools::getShopProtocol(), $url_cover);
              $url_prod = Context::getContext()->link->getProductLink($value['id_product']);
              $url_prod = str_replace('http://', Tools::getShopProtocol(), $url_prod);
              $value['date_update'] = pSQL( $date_update);
              $value['unsubscribe'] = $this->getUnsubscribe($value['email']);
              $value['product_name'] = pSQL($value['product_name']);
              $value['id'] = (int)$i;
              $value['store_name'] = pSQL($shop->name);
              $value['product_link'] =  pSQL($url_prod);
              $value['product_img'] = pSQL($url_cover);
              Db::getInstance()->insert('helpdesc_orders_data', $value);
              $i = $i+1;
          }
          catch (Exception $e){
              $i = $i+1;
              continue;
          }
        }
      }
    }
    return true;
  }

  public function getUnsubscribe($email){

    $sql = "
			SELECT o.unsubscribe
      FROM " . _DB_PREFIX_ . "helpdesc_orders_data o
      WHERE o.email = '".pSQL($email)."'
      AND unsubscribe = 1
      ORDER BY o.id_helpdesc_order_data 
      LIMIT 1
			";
    $res = Db::getInstance(_PS_USE_SQL_SLAVE_)->executeS($sql);
    if (isset($res[0]['unsubscribe']) && $res[0]['unsubscribe']){
      return 1;
    }
    return 0;
  }

  public function getOrdersHelpdesc($id_status = false, $send_added = false,  $id_shop = false, $period = false, $group = false, $limit = false){

    $where = "";
    $group_by = "";
    $limit_res = "";

    if(!$send_added){
      $where .= "  AND o.added_review = 0";
    }

    if($id_shop){
      $where .= "  AND o.id_shop = ".(int)$id_shop;
    }

    if($id_status){
      $where .= "  AND o.id_status = ".(int)$id_status;
    }

    if($period){
      $where .= $period;
    }

    if($group){
      $group_by .= ' GROUP BY o.email';
    }

    if($limit){
      $limit_res .= ' LIMIT 1';
    }

    $sql = "
			SELECT *
      FROM " . _DB_PREFIX_ . "helpdesc_orders_data o
      WHERE 1
      ".$where."
      ".$group_by."
      ".$limit_res."
			";
    return Db::getInstance(_PS_USE_SQL_SLAVE_)->executeS($sql);
  }

  public function getIssetOrderHelpdesc($id_order, $id_product){

    $sql = "
			SELECT o.id_helpdesc_order_data
      FROM " . _DB_PREFIX_ . "helpdesc_orders_data o
      WHERE o.id_order = ".(int)$id_order."
      AND o.id_product = ".(int)$id_product."
			";

    $res = Db::getInstance(_PS_USE_SQL_SLAVE_)->executeS($sql);

    if (isset($res[0]['id_helpdesc_order_data']) && $res[0]['id_helpdesc_order_data']){
      return $res[0]['id_helpdesc_order_data'];
    }

    return false;
  }

  public function sendItem($email, $subject, $message, $info_order_return){

    $template_vars = array('{content}' => $message);
    $sent = $this->sendMessage($template_vars, $email, $subject);
    if($sent){
      $sent_count = (int)Configuration::getGlobalValue('LAST_LETTERS_SENT');
      $sent_data = Tools::unSerialize(Configuration::getGlobalValue('LAST_LETTERS_SENT_DATA'));
      $sent_data[] = $info_order_return;
      Configuration::updateGlobalValue('LAST_LETTERS_SENT_DATA', serialize($sent_data));

      Configuration::updateGlobalValue('LAST_LETTERS_SENT', ((int)$sent_count+1));
      return true;
    }
    return false;
  }

  public function getDateStatus($id_order){

    $sql = "
			SELECT oh.date_add
      FROM " . _DB_PREFIX_ . "orders o
      LEFT JOIN " . _DB_PREFIX_ . "order_history oh
      ON o.id_order = oh.id_order
      WHERE o.id_order = ".(int)$id_order."
      ORDER BY oh.date_add DESC
      LIMIT 1
			";

    $res = Db::getInstance(_PS_USE_SQL_SLAVE_)->executeS($sql);

    if(isset($res[0]['date_add']) && $res[0]['date_add']){
      return $res[0]['date_add'];
    }
    return false;

  }

  public function getOrders(){

    $sql = "
			SELECT o.id_order, o.id_shop, o.id_lang, o.current_state as id_status, od.product_id as id_product , od.product_name as product_name, CONCAT(c.firstname, ' ', c.lastname) as customer, c.email, o.date_add as date_order, o.date_add as date_update
      FROM " . _DB_PREFIX_ . "orders o
      LEFT JOIN " . _DB_PREFIX_ . "order_detail od
      ON o.id_order = od.id_order
      LEFT JOIN " . _DB_PREFIX_ . "customer c
      ON c.id_customer = o.id_customer
      WHERE 1
			";

    return  Db::getInstance(_PS_USE_SQL_SLAVE_)->executeS($sql);
  }

  public function sendMessages($message, $message_moderator, $email_moderators, $email_user, $heading)
  {
    $response = array();

    if($email_moderators){
      foreach($email_moderators as $send_to){
        $template_vars = array('{content}' => $message_moderator);
        $res = $this->sendMessage($template_vars, trim($send_to['email']), $heading);
        $response[$send_to['email']] = $res;
      }
    }

    if($email_user){
        $template_vars = array('{content}' => $message);
        $res = $this->sendMessage($template_vars, trim($email_user), $heading);
        $response[$email_user] = $res;
    }

    return $response;
  }

  public function sendMessage($template_vars, $send_to, $heading){

    $mail = Mail::Send(
      Configuration::get('PS_LANG_DEFAULT'),
      'mpm_helpdesc',
      $heading,
      $template_vars,
      "$send_to",
      NULL,
      NULL,
      NULL,
      NULL,
      NULL,
      dirname(__FILE__).'/mails/');

    return $mail;
  }

  public function clearCache($id_shop = false, $id_product = false, $reviews_rating = false, $dedicated_reviews = false)
  {
    $where = "";
    $where2 = "(type = 'store_reviews' OR type = 'dedicated_reviews')";

    if($id_shop){
      $where .= 'id_shop = '.(int)$id_shop;
      $where2 .= ' AND id_shop = '.(int)$id_shop;
    }

    if($id_product){
      $where .= ' AND id_product = '.(int)$id_product;
    }

      if(!$id_product){
          Configuration::updateValue('HELPDESC_CSS_TIME', time());
      }

    Db::getInstance()->delete('page_helpdesc', $where2 );

    if(!$dedicated_reviews){
      $this->updateReviewsRating($reviews_rating, $where);
    }

      $reviews_css = Tools::getValue('reviews_css');
      $reviews_js = Tools::getValue('reviews_js');

      if($id_shop){
          return $this->copyCssToMultistores($id_shop, $reviews_css, $reviews_js);
      }
      else{
          foreach( Shop::getShops() as $shop ){
              $this->copyCssToMultistores($shop['id_shop'], $reviews_css, $reviews_js);
          }
      }

    return true;
  }


  public function copyCssToMultistores($id_shop, $reviews_css, $reviews_js)
  {
      $views_folder = _PS_MODULE_DIR_ . 'mpm_helpdesc/views/';
      if (isset($reviews_css) && $reviews_css) {
          if (!file_exists($views_folder .'css/'.$id_shop.'/')) {
              mkdir($views_folder .'css/'.$id_shop.'/', 0777, true);
          }
          file_put_contents($views_folder . 'css/'.$id_shop.'/myprestareviews.css', file_get_contents($reviews_css.$id_shop.'/myprestareviews.css'));
          file_put_contents($views_folder . 'css/'.$id_shop.'/myprestareviews_rating.css', file_get_contents($reviews_css.$id_shop.'/myprestareviews_rating.css'));
      }
      if (isset($reviews_js) && $reviews_js) {
          file_put_contents($views_folder . 'js/myprestareviews.js', file_get_contents($reviews_js));
      }
  }

  public function getOrderStatuses()
  {
    $idLang = Context::getContext()->language->id;

    $sql = '
        SELECT osl.id_order_state, osl.name
        FROM `'._DB_PREFIX_.'order_state_lang` osl  
        WHERE osl.id_lang = "'.(int)$idLang.'"
      ';

    $res = Db::getInstance(_PS_USE_SQL_SLAVE_)->executeS($sql);
    return $res;
  }

  public function getMultistores()
  {
    $data = array();

    foreach( Shop::getShops() as $key => $shop ){
      $data[$key]['name'] = $shop['name'];
      $data[$key]['id_shop'] = $shop['id_shop'];
      $data[$key]['uri'] = $this->getShopLink($shop['id_shop']);
    }
    return $data;
  }

  public function getLanguages()
  {
    $data = array();

    foreach( Shop::getShops() as $shop ){
      foreach( Language::getLanguages(1, $shop['id_shop']) as $k => $language ){
        $data[$shop['id_shop']][$k]['name'] = $language['name'];
        $data[$shop['id_shop']][$k]['id_language'] = $language['id_lang'];
      }
    }
    return $data;
  }

  private function _checkSecureKey()
  {
    if( Tools::getValue('secure_key') !== Configuration::get('GOMAKOIL_HELPDESCR_SECURE_KEY') ){
      throw new Exception('Wrong secure key');
    }
  }

  protected function getShopLink($id_shop = null)
  {
    $ssl = (Configuration::get('PS_SSL_ENABLED') && Configuration::get('PS_SSL_ENABLED_EVERYWHERE'));
    $shop = new Shop($id_shop);
    $url = ($ssl) ? 'https://'.$shop->domain_ssl : 'http://'.$shop->domain;
    return $url.$shop->physical_uri.$shop->virtual_uri;
  }
}

