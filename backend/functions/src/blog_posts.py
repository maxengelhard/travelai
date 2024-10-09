import json
import os
import boto3
from botocore.exceptions import ClientError
import markdown
import yaml
from lambda_decorators import json_http_resp, cors_headers , load_json_body
from urllib.parse import unquote


s3 = boto3.client('s3')

def get_blog_posts(bucket_name, prefix):
    posts = []
    try:
        response = s3.list_objects_v2(Bucket=bucket_name, Prefix=prefix)
        for obj in response.get('Contents', []):
            if obj['Key'].endswith('.md'):
                post = get_post_data(bucket_name, obj['Key'])
                if post:
                    posts.append(post)
    except ClientError as e:
        print(f"Error fetching blog posts: {e}")
    return sorted(posts, key=lambda x: x['date'], reverse=True)

def get_post_data(bucket_name, key):
    try:
        response = s3.get_object(Bucket=bucket_name, Key=key)
        content = response['Body'].read().decode('utf-8')
        parts = content.split('---', 2)
        if len(parts) == 3:
            front_matter = yaml.safe_load(parts[1])
            post_content = parts[2]
            return {
                'id': os.path.splitext(os.path.basename(key))[0],
                **front_matter,
                'content': markdown.markdown(post_content)
            }
    except ClientError as e:
        print(f"Error fetching post {key}: {e}")
    return None


@cors_headers
@load_json_body
@json_http_resp
def lambda_handler(event, context):
    bucket_name = os.environ['BLOG_BUCKET']
    prefix = os.environ['BLOG_PREFIX']
    
    query_params = event.get('queryStringParameters', {}) or {}
    post_title = query_params.get('title')

    if post_title:
        # URL decode the title
        post_title = unquote(post_title)
        # Replace spaces with hyphens and make lowercase
        file_name = post_title.replace(' ', '-').lower() + '.md'
        post = get_post_data(bucket_name, f"{prefix}{file_name}")
        if post:
            return {
                'statusCode': 200,
                'body': post
            }
        else:
            return {
                'statusCode': 404,
                'body': {'error': 'Post not found'}
            }
    else:
        posts = get_blog_posts(bucket_name, prefix)
        if posts:   
            return {
                'statusCode': 200,
                'body': posts
            }
        else:
            return {
                'statusCode': 404,
                'body': {'error': 'Posts not found'}
            }
