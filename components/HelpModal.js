import React from 'react';
import { Modal, Typography, Collapse, Button, Divider } from 'antd';
import { QuestionCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';

const { Text, Title, Paragraph, Link } = Typography;
const { Panel } = Collapse;

const HelpModal = ({ visible, onClose }) => {
  return (
    <Modal
      title={
        <div className="modal-title">
          <QuestionCircleOutlined className="modal-icon" />
          <span>帮助中心</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      className="help-modal glass-modal"
      width={600}
    >
      <div className="help-content">
        <Collapse bordered={false} ghost className="help-collapse">
          <Panel header={<div className="panel-header"><InfoCircleOutlined /> 如何使用本工具</div>} key="1">
            <Paragraph className="help-paragraph">
              本工具可以帮助您更新 Zepp Life (原小米运动) 的步数数据，使用方法如下：
            </Paragraph>
            <ol className="help-list">
              <li>1、在应用商店中下载【Zepp Life】app</li>
              <li>打开软件并选择'没有账号立即注册'</li>
              <li>一定要新注册 不能用小米手机的账号</li>
              <li>2、进入"Zepp Life"app，依次点击:</li>
              <li>我的->第三方接入->绑定你想同步数据的平台。</li>
              <li>3、最后登陆此刷步系统进行刷步~.</li>
            </ol>
          </Panel>
          
          <Panel header={<div className="panel-header"><InfoCircleOutlined /> 关于随机步数功能</div>} key="2">
            <Paragraph className="help-paragraph">
              启用随机步数功能后，系统将在您设置的范围内生成一个随机步数。这对于想要每天自动更新不同步数的用户非常有用。
            </Paragraph>
            <Paragraph className="help-paragraph">
              使用方法：
            </Paragraph>
            <ol className="help-list">
              <li>在步数输入框旁边打开随机功能开关</li>
              <li>使用滑块设置随机步数的范围</li>
              <li>可以点击"生成随机步数"按钮预览随机结果</li>
              <li>点击"立即更新步数"按钮提交</li>
            </ol>
          </Panel>
          
          <Panel header={<div className="panel-header"><InfoCircleOutlined /> 自动更新功能说明</div>} key="3">
            <Paragraph className="help-paragraph">
              您可以在设置中启用自动更新功能，让系统按照指定的时间间隔自动为您更新步数数据。
            </Paragraph>
            <Paragraph className="help-paragraph">
              注意事项：
            </Paragraph>
            <ul className="help-list">
              <li>使用自动更新功能需要保持网页处于打开状态</li>
              <li>可以设置1-24小时不等的更新间隔</li>
              <li>自动更新时会使用您设置的随机步数范围（如果启用了随机功能）</li>
              <li>您可以在设置中随时关闭此功能</li>
              <li>注：会员版无需开启网页，24小时自动按照您设置的时间上传步数</li>
              <li>会员版入口https://ol.hpny.shop/</li>
            </ul>
          </Panel>
          
          <Panel header={<div className="panel-header"><InfoCircleOutlined /> 数据安全与隐私</div>} key="4">
            <Paragraph className="help-paragraph">
              我们非常重视您的数据安全和隐私保护：
            </Paragraph>
            <ul className="help-list">
              <li>所有数据仅存储在您的浏览器本地，不会上传到服务器</li>
              <li>密码在本地存储时会进行加密处理</li>
              <li>您可以随时在设置中清除所有数据</li>
              <li>本工具与小米/Zepp官方无关，仅用于学习研究</li>
            </ul>
          </Panel>
          
          <Panel header={<div className="panel-header"><InfoCircleOutlined /> 常见问题</div>} key="5">
            <Paragraph className="help-paragraph">
              <strong>Q: 为什么更新步数失败？</strong>
            </Paragraph>
            <Paragraph className="help-paragraph">
              A: 可能的原因有：账号或密码错误、网络问题、服务器繁忙或接口变更等。请检查您的账号信息，稍后重试。
            </Paragraph>
            
            <Divider className="help-divider" />
            
            <Paragraph className="help-paragraph">
              <strong>Q: 更新的步数数据多久会同步到其他设备？</strong>
            </Paragraph>
            <Paragraph className="help-paragraph">
              A: 通常情况下，数据更新后会在几分钟内同步到您的手机App和关联设备，但具体时间可能因网络状况而异。
            </Paragraph>
            
            <Divider className="help-divider" />
            
            <Paragraph className="help-paragraph">
              <strong>Q: 步数数据有上限吗？</strong>
            </Paragraph>
            <Paragraph className="help-paragraph">
              A: 建议设置的步数不要超过100,000步，否则可能因过于不合理而被系统拒绝。
            </Paragraph>
          </Panel>
        </Collapse>
        
        <Divider className="help-divider" />
        
        <div className="help-footer">
          <Button type="primary" onClick={onClose}>
            我知道了
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default HelpModal; 
