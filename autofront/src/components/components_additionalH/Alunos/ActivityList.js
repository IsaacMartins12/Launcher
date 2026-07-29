      // ActivityList.js
      import React from 'react';
      import { List } from 'antd';

      const ActivityList = ({ activities }) => {
        return (
          <div style={{ marginTop: '20px' }}>
            <List
              header={<div>Activities</div>}
              dataSource={activities}
              renderItem={(item, index) => (
                <List.Item>
                  <List.Item.Meta title={`${index + 1}. ${item.title}`} description={`Type: ${item.type}, Hours: ${item.hours}h`} />
                </List.Item>
              )}
            />
          </div>
        );
      };

      export default ActivityList;
